function DataTable({
    columns,
    data,
    emptyMessage = "No records found.",
    getRowKey,
    isLoading = false,
}) {
    if (isLoading) {
        return (
            <div className="table-state">
                <span className="material-symbols-outlined table-state-icon">sync</span>
                Loading records...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="table-state">
                <span className="material-symbols-outlined table-state-icon">database</span>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                className={column.align === "right" ? "align-right" : ""}
                                key={column.key}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={getRowKey ? getRowKey(row) : row.id ?? index}>
                            {columns.map((column) => (
                                <td
                                    className={column.align === "right" ? "align-right" : ""}
                                    key={column.key}
                                >
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
