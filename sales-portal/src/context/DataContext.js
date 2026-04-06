import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';


const DataContext = createContext(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all data
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, salesmenRes, customersRes, salesRes] = await Promise.all([
                dataService.getProducts(),
                dataService.getSalesmen(),
                dataService.getCustomers(),
                dataService.getSales()
            ]);

            setProducts(productsRes.data);
            setSalesmen(salesmenRes.data);
            setCustomers(customersRes.data);
            setSales(salesRes.data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Product functions
    const addProduct = async (productData) => {
        try {
            const response = await dataService.addProduct(productData);
            setProducts([...products, response.data]);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const response = await dataService.updateProduct(id, productData);
            setProducts(products.map(p => p.id === id ? response.data : p));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const deleteProduct = async (id) => {
        try {
            await dataService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Salesman functions
    const addSalesman = async (salesmanData) => {
        try {
            const response = await dataService.addSalesman(salesmanData);
            setSalesmen([...salesmen, response.data]);
            return { success: true, data: response.data };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const updateSalesman = async (id, salesmanData) => {
        try {
            const response = await dataService.updateSalesman(id, salesmanData);
            setSalesmen(salesmen.map(s => s.id === id ? response.data : s));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const deleteSalesman = async (id) => {
        try {
            await dataService.deleteSalesman(id);
            setSalesmen(salesmen.filter(s => s.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const updateSalesmanTarget = async (id, month, target) => {
        try {
            await dataService.setSalesmanTarget(id, month, target);
            // Updating local state
            setSalesmen(salesmen.map(s => {
                if (s.id === id) {
                    const existing = s.monthly_targets || [];
                    const updatedMt = [...existing.filter(m => m.month !== month), { month, target_amount: parseFloat(target) }];
                    return { ...s, monthly_targets: updatedMt };
                }
                return s;
            }));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Customer functions
    const addCustomer = async (customerData) => {
        try {
            const response = await dataService.addCustomer(customerData);
            setCustomers([...customers, response.data]);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const deleteCustomer = async (id) => {
        try {
            await dataService.deleteCustomer(id);
            setCustomers(customers.filter(c => c.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Sale functions
    const addSale = async (saleData) => {
        try {
            const response = await dataService.addSale(saleData);
            setSales([...sales, response.data]);
            
            // Update local product stock
            setProducts(currentProducts => currentProducts.map(p => {
                if (p.id === saleData.product_id) {
                    return { ...p, quantity: p.quantity - saleData.quantity };
                }
                return p;
            }));
            
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const deleteSale = async (id) => {
        try {
            const saleToDelete = sales.find(s => s.id === id);
            await dataService.deleteSale(id);
            setSales(sales.filter(s => s.id !== id));
            
            // Restore local product stock
            if (saleToDelete) {
                setProducts(currentProducts => currentProducts.map(p => {
                    if (p.id === saleToDelete.product_id) {
                        return { ...p, quantity: p.quantity + saleToDelete.quantity };
                    }
                    return p;
                }));
            }
            
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // Calculate statistics
    const getStats = useCallback(() => {
        const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
        const totalProducts = products.length;
        const totalSalesmen = salesmen.length;

        // Sales by salesman
        const salesBySalesman = salesmen.map(salesman => ({
            ...salesman,
            totalSales: sales
                .filter(sale => sale.user_id === salesman.id)
                .reduce((sum, sale) => sum + sale.amount, 0),
            salesCount: sales.filter(sale => sale.user_id === salesman.id).length
        }));

        // Top salesmen
        const topSalesmen = [...salesBySalesman]
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);

        // Sales by month
        const salesByMonth = {};
        sales.forEach(sale => {
            const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            salesByMonth[month] = (salesByMonth[month] || 0) + sale.amount;
        });

        return {
            totalSales,
            totalProducts,
            totalSalesmen,
            salesBySalesman,
            topSalesmen,
            salesByMonth,
        };
    }, [sales, products, salesmen]);

    const lowStockProducts = React.useMemo(() => {
        return products.filter(p => p.quantity <= (p.low_stock_threshold || 10));
    }, [products]);

    const value = {
        products,
        salesmen,
        customers,
        sales,
        loading,
        error,
        fetchAllData,
        addProduct,
        updateProduct,
        deleteProduct,
        addSalesman,
        updateSalesman,
        deleteSalesman,
        updateSalesmanTarget,
        addCustomer,
        deleteCustomer,
        addSale,
        deleteSale,
        getStats, // Legacy client-side stats, consider removing if fully migrated
        getPredictions: dataService.getPredictions,
        getDashboardStats: dataService.getDashboardStats,
        getReportsData: dataService.getReportsData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};