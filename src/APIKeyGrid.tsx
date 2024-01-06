import React from 'react';
import { useState, useEffect } from 'react';
import DataGrid ,{ SelectColumn } from 'react-data-grid';
import { ApiKey } from './models/ApiKey';
import 'react-data-grid/lib/styles.css'; // or similar path


interface APIKeyGridProps {
  apiKeys: ApiKey[];
  keySelectedId: string; // Assuming you want to track a single selected key ID
  onRowSelected: (selectedRows: ReadonlySet<string>) => void; // Callback for when rows are selected
}
const APIKeyGrid: React.FC<APIKeyGridProps> = ({ apiKeys, keySelectedId, onRowSelected }) => {
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set());
    // useEffect to update selectedRows based on keySelectedId prop
    useEffect(() => {
      if (keySelectedId) {
        setSelectedRows(new Set([keySelectedId]));
      }
    }, [keySelectedId]);
  const columns = [
    SelectColumn,

    { key: 'name', name: 'Name' },
    { key: 'model', name: 'Model' },
    { key: 'description', name: 'Description' },
    { key: 'maxContextLength', name: 'Max. Context Length' },
    { key: 'totalCost', name: 'Total Cost' },
    { key: 'uri', name: 'URI' },  
 
    // Add other columns as needed
  ];


  const rowKeyGetter = (row: ApiKey) => {
    return row.keyId;
  };

  return (
    <DataGrid
      
      columns={columns.map(column => ({
        ...column,
        className: `column-${column.key}`
    }))}

      rows={apiKeys}
      selectedRows={selectedRows}
      onSelectedRowsChange={(newSelectedRows) => {
        // Extract the latest selected row's key, ensuring it is a string
        const selectedRowArray = Array.from(newSelectedRows);
        const latestSelectedRowKey = selectedRowArray.length > 0 
            ? selectedRowArray[selectedRowArray.length - 1] 
            : null;

        // Update the selectedRows state
        if (latestSelectedRowKey) {
            const latestSelectedRow: ReadonlySet<string> = new Set([latestSelectedRowKey]);
            setSelectedRows(latestSelectedRow);
            onRowSelected(latestSelectedRow); // Notify parent component of the selection change
        } else {
            setSelectedRows(new Set()); // Empty set when no rows are selected
        }
    }}
      rowKeyGetter={rowKeyGetter}

    />
  );
};

export default APIKeyGrid;

