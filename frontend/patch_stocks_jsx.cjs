const fs = require('fs');
let code = fs.readFileSync('src/pages/Stocks.jsx', 'utf-8');

const target = `    async function handleDelete(stockId) {
        setError("");
        const currentStock = stocks.find((stock) => stock.id === stockId);
        const shouldDelete = window.confirm(
            \`Delete \${currentStock?.symbol || "this stock"}? This action cannot be undone.\`
        );
        if (!shouldDelete) {
            return;
        }
        try {
            await api.delete(\`/stocks/\${stockId}\`);
            setStocks((currentStocks) => currentStocks.filter((stock) => stock.id !== stockId));
        } catch (deleteError) {
            setError(getApiError(deleteError, "Unable to delete stock"));
        }
    }`;

const replacement = `    async function handleDelete(stockId) {
        setError("");
        const currentStock = stocks.find((stock) => stock.id === stockId);
        const shouldDelete = window.confirm(
            \`Delete \${currentStock?.symbol || "this stock"}? This action cannot be undone.\`
        );
        if (!shouldDelete) {
            return;
        }
        try {
            await api.delete(\`/stocks/\${stockId}\`, { silent: true });
            setStocks((currentStocks) => currentStocks.filter((stock) => stock.id !== stockId));
        } catch (deleteError) {
            if (deleteError?.response?.status === 409) {
                setError(\`Cannot delete \${currentStock?.symbol || "this stock"} because existing transactions reference this stock.\`);
            } else {
                console.error("Deletion failure:", deleteError);
                setError("Failed to delete stock. Please try again later.");
            }
        }
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Stocks.jsx', code);
