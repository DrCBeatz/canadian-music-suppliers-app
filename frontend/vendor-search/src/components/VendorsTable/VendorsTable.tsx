// VendorsTable.tsx

import "./VendorsTable.css";

export interface Vendor {
  id: number;
  name: string;
  suppliers: {
    name: string;
    contact_name?: string;
    contact_email?: string;
    website?: string;
    phone?: string;
  }[];
  categories: { name: string }[];
}

interface VendorsTableProps {
  vendors: Vendor[];
}

const VendorsTable: React.FC<VendorsTableProps> = ({ vendors }) => (
  <table className="vendors-table">
    <thead>
      <tr>
        <th className="vendors-table__header-cell">Vendor</th>
        <th className="vendors-table__header-cell">Suppliers</th>
        <th className="vendors-table__header-cell">Contact Name</th>
        <th className="vendors-table__header-cell">Contact Email</th>
        <th className="vendors-table__header-cell">Website</th>
        <th className="vendors-table__header-cell">Phone</th>
        <th className="vendors-table__header-cell">Categories</th>
      </tr>
    </thead>
    <tbody>
      {vendors.map((vendor) => (
        <tr className="vendors-table__row" key={vendor.id}>
          <td className="vendors-table__cell">{vendor.name}</td>
          <td className="vendors-table__cell">
            {vendor.suppliers.map((supplier) => supplier.name).join(", ")}
          </td>
          <td className="vendors-table__cell">
            {vendor.suppliers[0]?.contact_name || "-"}
          </td>
          <td className="vendors-table__cell">
            {vendor.suppliers[0]?.contact_email || "-"}
          </td>
          <td className="vendors-table__cell">
            {vendor.suppliers[0]?.website || "-"}
          </td>
          <td className="vendors-table__cell">
            {vendor.suppliers[0]?.phone || "-"}
          </td>
          <td className="vendors-table__cell">
            {vendor.categories.map((category) => category.name).join(", ")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default VendorsTable;
