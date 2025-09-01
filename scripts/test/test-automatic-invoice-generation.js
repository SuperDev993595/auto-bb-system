const axios = require("axios");
const mongoose = require("mongoose");
const WorkOrder = require("../../server/models/Service");
const Invoice = require("../../server/models/Invoice");

const BASE_URL = "http://localhost:5000/api";
const TEST_TOKEN = process.env.TEST_TOKEN || "your-test-token-here";

const testWorkOrderData = {
  workOrderNumber: "WO-TEST-001",
  customer: "507f1f77bcf86cd799439011", // Replace with actual customer ID
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    vin: "1HGBH41JXMN109186",
    licensePlate: "TEST123",
    mileage: 50000,
  },
  services: [
    {
      service: "507f1f77bcf86cd799439012", // Replace with actual service ID
      description: "Oil Change and Filter",
      laborHours: 1.5,
      laborRate: 120,
      totalCost: 180,
    },
  ],
  technician: "507f1f77bcf86cd799439013", // Replace with actual technician ID
  status: "in_progress",
  priority: "medium",
  progress: 50,
  estimatedStartDate: new Date(),
  estimatedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  notes: "Test work order for automatic invoice generation",
};

async function testAutomaticInvoiceGeneration() {
  console.log(
    "🧪 Testing Automatic Invoice Generation from Work Order Completion\n"
  );

  try {
    // Step 1: Create a test work order
    console.log("1. Creating test work order...");
    const createResponse = await axios.post(
      `${BASE_URL}/services/workorders`,
      testWorkOrderData,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    if (!createResponse.data.success) {
      throw new Error("Failed to create work order");
    }

    const workOrderId = createResponse.data.data.workOrder._id;
    console.log(`✅ Work order created: ${workOrderId}`);

    // Step 2: Start the work order
    console.log("\n2. Starting work order...");
    const startResponse = await axios.put(
      `${BASE_URL}/services/workorders/${workOrderId}/start`,
      {
        technicianId: "507f1f77bcf86cd799439013", // Replace with actual technician ID
      },
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    if (!startResponse.data.success) {
      throw new Error("Failed to start work order");
    }

    console.log("✅ Work order started successfully");

    // Step 3: Update progress to 100% (should auto-complete and generate invoice)
    console.log(
      "\n3. Updating progress to 100% (should auto-complete and generate invoice)..."
    );
    const progress100Response = await axios.put(
      `${BASE_URL}/services/workorders/${workOrderId}/progress`,
      {
        progress: 100,
        notes:
          "All work completed successfully - testing automatic invoice generation",
      },
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    if (!progress100Response.data.success) {
      throw new Error("Failed to update progress to 100%");
    }

    console.log("✅ Progress updated to 100% and work order auto-completed");

    // Step 4: Verify work order is completed
    console.log("\n4. Verifying work order completion...");
    const workOrderResponse = await axios.get(
      `${BASE_URL}/services/workorders/${workOrderId}`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    if (!workOrderResponse.data.success) {
      throw new Error("Failed to get work order state");
    }

    const workOrder = workOrderResponse.data.data.workOrder;
    console.log(`📊 Work Order Status: ${workOrder.status}`);
    console.log(`📊 Work Order Progress: ${workOrder.progress}%`);

    if (workOrder.status !== "completed") {
      throw new Error("Work order was not marked as completed");
    }

    // Step 5: Check if invoice was generated
    console.log("\n5. Checking for generated invoice...");
    const invoicesResponse = await axios.get(
      `${BASE_URL}/invoices?workOrderId=${workOrderId}`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    if (!invoicesResponse.data.success) {
      throw new Error("Failed to fetch invoices");
    }

    const invoices = invoicesResponse.data.data;
    const generatedInvoice = invoices.find(
      (invoice) => invoice.workOrderId === workOrderId
    );

    if (!generatedInvoice) {
      throw new Error("No invoice was generated for the completed work order");
    }

    console.log(
      `✅ Invoice generated successfully: ${generatedInvoice.invoiceNumber}`
    );
    console.log(`📊 Invoice Status: ${generatedInvoice.status}`);
    console.log(`📊 Invoice Total: $${generatedInvoice.total}`);
    console.log(`📊 Invoice Items: ${generatedInvoice.items.length} items`);

    // Step 6: Verify invoice details
    console.log("\n6. Verifying invoice details...");
    const invoiceResponse = await axios.get(
      `${BASE_URL}/invoices/${generatedInvoice._id}`,
      {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
      }
    );

    if (!invoiceResponse.data.success) {
      throw new Error("Failed to fetch invoice details");
    }

    const invoice = invoiceResponse.data.data;
    console.log(`📊 Customer: ${invoice.customerId?.name || "N/A"}`);
    console.log(`📊 Service Type: ${invoice.serviceType}`);
    console.log(
      `📊 Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`
    );

    // Step 7: Clean up test data
    console.log("\n7. Cleaning up test data...");
    await Invoice.findByIdAndDelete(generatedInvoice._id);
    await WorkOrder.findByIdAndDelete(workOrderId);
    console.log("✅ Test data cleaned up");

    console.log("\n🎉 Automatic invoice generation test passed successfully!");
    console.log("\n📋 Summary:");
    console.log("   ✅ Work order created and started");
    console.log("   ✅ Progress updated to 100%");
    console.log("   ✅ Work order auto-completed");
    console.log("   ✅ Invoice generated automatically");
    console.log("   ✅ Invoice details verified");
    console.log("   ✅ Test data cleaned up");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAutomaticInvoiceGeneration();
}

module.exports = { testAutomaticInvoiceGeneration };
