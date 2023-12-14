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
    { key: 'uri', name: 'URI' },
    { key: 'homepage', name: 'Homepage' },
    { key: 'userId', name: 'User ID' },
    { key: 'totalCost', name: 'Total Cost' },
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
        setSelectedRows(newSelectedRows);
        onRowSelected(newSelectedRows); // Notify parent component of the selection change
      }}
      rowKeyGetter={rowKeyGetter}

    />
  );
};

export default APIKeyGrid;

