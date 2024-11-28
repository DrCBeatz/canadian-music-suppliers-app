# Canada Music Suppliers Admin Documentation

This readme provides guidance on managing the Canada Music Suppliers application data using the Django Admin interface. You can use Django Admin to add, update, and delete the information for the models used in the app. Below are step-by-step instructions for managing each model: **Vendor**, **Supplier**, **Contact**, and **Category**.

## Accessing Django Admin

1. Navigate to the admin URL for the backend of the Canada Music Suppliers application (for access to the Django Admin interface, please refer to the AYNM employee handbook or contact the system administrator).
2. You will need administrative credentials to log in. If you do not have an account, request access from the system administrator.

Once logged in, you will see the various models available for management.

## Managing Models

### 1. Vendors

**Vendors** represent the businesses that manufacture musical instruments, equipment and accessories.

- **Add a Vendor**:
  1. Click on **Vendors** in the Django Admin interface.
  2. Click **Add Vendor** in the top right corner.
  3. Fill in the fields:
     - **Name**: The vendor's name.
     - **Suppliers**: Add existing suppliers to the vendor. This relationship can be updated using the **Suppliers** field.
     - **Categories**: Choose one or more categories that are associated with the vendor.
  4. Click **Save**.

- **Update a Vendor**:
  1. Click on **Vendors**.
  2. Click on the **name** of the vendor you wish to update.
  3. Edit the fields as needed.
  4. Click **Save**.

- **Delete a Vendor**:
  1. Click on **Vendors**.
  2. Select the vendor you wish to delete by checking the checkbox beside the vendor's name.
  3. Use the dropdown at the top to select **Delete selected vendors**, then click **Go**.

### 2. Suppliers

**Suppliers** represent businesses that distribute products created by distributors to music retailers.

- **Add a Supplier**:
  1. Click on **Suppliers** in the Django Admin interface.
  2. Click **Add Supplier** in the top right corner.
  3. Fill in the fields:
     - **Name**: Supplier's name.
     - **Contacts**: Select from existing contacts or add new contacts to this supplier.
     - **Website, Phone, and Contact Details**: Enter any other relevant details like website credentials, minimum order, shipping fees, etc.
  4. Click **Save**.

- **Update a Supplier**:
  1. Click on **Suppliers**.
  2. Click on the **name** of the supplier you wish to update.
  3. Update any fields, such as contacts or order information.
  4. Click **Save**.

- **Delete a Supplier**:
  1. Click on **Suppliers**.
  2. Select the supplier you wish to delete by checking the checkbox beside the supplier's name.
  3. Use the dropdown at the top to select **Delete selected suppliers**, then click **Go**.

### 3. Contacts

**Contacts** are individuals associated with suppliers. Contacts can serve various roles such as primary contact or accounting.

- **Add a Contact**:
  1. Click on **Contacts** in the Django Admin interface.
  2. Click **Add Contact** in the top right corner.
  3. Fill in the fields:
     - **Name**: Contact's name.
     - **Email**: Optional, but recommended for communication.
     - **Role**: Define the role of the contact, such as primary contact, accounting, etc.
     - **Primary Contact**: Check this box if this contact is the main point of contact.
  4. Click **Save**.

- **Update a Contact**:
  1. Click on **Contacts**.
  2. Click on the **name** of the contact you wish to update.
  3. Update the information as necessary, including roles or contact details.
  4. Click **Save**.

- **Delete a Contact**:
  1. Click on **Contacts**.
  2. Select the contact you wish to delete by checking the checkbox beside the contact's name.
  3. Use the dropdown at the top to select **Delete selected contacts**, then click **Go**.

### 4. Categories

**Categories** allow you to organize vendors by different product or service categories.

- **Add a Category**:
  1. Click on **Categories** in the Django Admin interface.
  2. Click **Add Category** in the top right corner.
  3. Enter the **Name** of the category.
  4. Click **Save**.

- **Update a Category**:
  1. Click on **Categories**.
  2. Click on the **name** of the category you wish to update.
  3. Edit the name as necessary.
  4. Click **Save**.

- **Delete a Category**:
  1. Click on **Categories**.
  2. Select the category you wish to delete by checking the checkbox beside the category's name.
  3. Use the dropdown at the top to select **Delete selected categories**, then click **Go**.

## Additional Notes

- **Field Descriptions**: The Django Admin form includes fields for each model's attributes, such as `Name`, `Contact`, `Website`, and others. Fields marked as `Read-only` (e.g., **Contacts** on Supplier pages) are not directly editable from that view but may be modified through related models.

- **Website Password Encryption**: For Suppliers, the `website_password` field is encrypted for security purposes. When entering or updating this field, be aware that the stored password is encrypted, and the decryption is handled internally.

- **Primary Contacts**: Only one contact can be marked as `Primary Contact` for a given supplier. If you mark a new contact as `Primary`, any previously marked primary contact for that supplier will automatically be unmarked.

## Troubleshooting

- If you encounter any issues updating or saving data, check the **error messages** provided by Django Admin. It will often provide specific feedback on what might be missing or incorrectly formatted.

- **Permissions**: Make sure the user has the appropriate permissions to add, update, or delete data in the Django Admin. Permissions can be set in the **Users** section in the Admin.

## Summary
This documentation helps you use the Django Admin to manage the app's core data: Vendors, Suppliers, Contacts, and Categories. Make sure to review each model's requirements before making changes, and refer to this guide for any issues you encounter while working with the Django Admin.
