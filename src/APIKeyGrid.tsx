import React, { useState, useEffect } from 'react';
import DataGrid, { SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { ApiKey } from './models/ApiKey';

interface APIKeyGridProps {
  apiKeys: ApiKey[];
  keySelectedId: string;
  onRowSelected: (selectedRows: ReadonlySet<string>) => void;
}

const APIKeyGrid: React.FC<APIKeyGridProps> = ({ apiKeys, keySelectedId, onRowSelected }) => {
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    // Initialize selection with keySelectedId if it's not disabled
    const initialRow = apiKeys.find(apiKey => apiKey.keyId === keySelectedId && !apiKey.disabled);
    if (initialRow) {
      setSelectedRows(new Set([keySelectedId]));
    }
  }, [keySelectedId, apiKeys]);

  const handleSelectedRowsChange = (newSelectedRows: Set<string>) => {
    // If no rows are selected, clear the selection
    if (newSelectedRows.size === 0) {
      setSelectedRows(new Set());
      onRowSelected(new Set());
      return;
    }

    // Extract the latest selected row's key
    const selectedRowKey = Array.from(newSelectedRows).pop();
    const selectedRow = apiKeys.find(apiKey => apiKey.keyId === selectedRowKey);

    // Check if the latest selected row is not disabled
    if (selectedRow && !selectedRow.disabled) {
      const updatedSelectedRows: ReadonlySet<string> = new Set([selectedRow.keyId]);
      setSelectedRows(updatedSelectedRows);
      onRowSelected(updatedSelectedRows);
    } else {
      // If the row is disabled, revert to the previous selection
      onRowSelected(selectedRows);
    }
  };

  const columns = [
    SelectColumn,
    { key: 'name', name: 'Name' },
    { key: 'model', name: 'Model' },
    { key: 'description', name: 'Description' },
    { key: 'maxContextLength', name: 'Context Length' },
    { key: 'totalCost', name: 'Total Cost' },
    { key: 'uri', name: 'URI' },
    // Define other columns as needed
  ];

  const rowKeyGetter = (row: ApiKey) => row.keyId;

  return (
    <div >
   
    <h2 style={{ textAlign: 'center', width: '100%' }}>Available APIs to use</h2>

    
    <DataGrid
      
      columns={columns.map(column => ({
        ...column,
        className: `column-${column.key}`
    }))}

      rows={apiKeys}
      rowKeyGetter={rowKeyGetter}
      selectedRows={selectedRows}
      onSelectedRowsChange={handleSelectedRowsChange}
    />
    </div>
  );
};

export default APIKeyGrid;