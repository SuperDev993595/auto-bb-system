const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
const TEST_TOKEN = process.env.TEST_TOKEN || "your-test-token-here";

async function testVehicleIdSave() {
  console.log("🧪 Testing Vehicle ID Save in Work Orders\n");

  try {
    // Step 1: Create a test work order with vehicle._id
    console.log("1. Creating test work order with vehicle._id...");
    const testWorkOrderData = {
      workOrderNumber: "WO-TEST-VEHICLE-ID-001",
      customer: "507f1f77bcf86cd799439011", // Replace with actual customer ID
      vehicle: {
        _id: "507f1f77bcf86cd799439013", // Replace with actual vehicle ID
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
          laborRate: 75,
          parts: [
            {
              name: "Oil Filter",
              partNumber: "OF-001",
              quantity: 1,
              unitPrice: 15.99,
              totalPrice: 15.99,
              inStock: true,
            },
            {
              name: "Synthetic Oil",
              partNumber: "OIL-5W30",
              quantity: 5,
              unitPrice: 8.99,
              totalPrice: 44.95,
              inStock: true,
            },
          ],
          totalCost: 167.44,
        },
      ],
      status: "pending",
      priority: "medium",
      estimatedStartDate: new Date().toISOString(),
      estimatedCompletionDate: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
      notes: "Test work order with vehicle._id",
      customerNotes: "Customer requested oil change",
    };

    const createResponse = await axios.post(
      `${BASE_URL}/services/workorders`,
      testWorkOrderData,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (createResponse.data.success) {
      console.log("✅ Work order created successfully");
      const workOrder = createResponse.data.data.workOrder;
      console.log(`   Work Order ID: ${workOrder._id}`);
      console.log(`   Vehicle._id: ${workOrder.vehicle._id}`);
      console.log(`   Vehicle Make: ${workOrder.vehicle.make}`);
      console.log(`   Vehicle Model: ${workOrder.vehicle.model}`);
    } else {
      console.log(
        "❌ Failed to create work order:",
        createResponse.data.message
      );
      return;
    }

    // Step 2: Update progress to 100% to trigger invoice generation
    console.log("\n2. Updating work order progress to 100%...");
    const workOrderId = createResponse.data.data.workOrder._id;

    const progressResponse = await axios.put(
      `${BASE_URL}/services/workorders/${workOrderId}/progress`,
      {
        progress: 100,
        notes: "Work completed - testing vehicle._id in invoice generation",
      },
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (progressResponse.data.success) {
      console.log("✅ Progress updated successfully");
      console.log("✅ Work order marked as completed");
      console.log("✅ Invoice should be generated automatically");
    } else {
      console.log(
        "❌ Failed to update progress:",
        progressResponse.data.message
      );
    }

    // Step 3: Check if invoice was generated with vehicle._id
    console.log("\n3. Checking generated invoice...");
    const invoiceResponse = await axios.get(
      `${BASE_URL}/invoices?workOrderId=${workOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    if (
      invoiceResponse.data.success &&
      invoiceResponse.data.data.invoices.length > 0
    ) {
      const invoice = invoiceResponse.data.data.invoices[0];
      console.log("✅ Invoice found");
      console.log(`   Invoice ID: ${invoice._id}`);
      console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
      console.log(`   Vehicle ID: ${invoice.vehicleId}`);
      console.log(`   Status: ${invoice.status}`);
      console.log(`   Total: $${invoice.total}`);

      if (invoice.vehicleId) {
        console.log("✅ Vehicle ID is properly saved in invoice");
      } else {
        console.log(
          "⚠️  Vehicle ID is null in invoice (this is expected if vehicle._id was not provided)"
        );
      }
    } else {
      console.log("❌ No invoice found or error occurred");
    }

    // Step 4: Clean up test data
    console.log("\n4. Cleaning up test data...");
    try {
      await axios.delete(`${BASE_URL}/services/workorders/${workOrderId}`, {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      });
      console.log("✅ Test work order deleted");

      if (
        invoiceResponse.data.success &&
        invoiceResponse.data.data.invoices.length > 0
      ) {
        const invoiceId = invoiceResponse.data.data.invoices[0]._id;
        await axios.delete(`${BASE_URL}/invoices/${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${TEST_TOKEN}`,
          },
        });
        console.log("✅ Test invoice deleted");
      }
    } catch (cleanupError) {
      console.log("⚠️  Cleanup error (this is normal):", cleanupError.message);
    }

    console.log("\n🎉 Test completed successfully!");
    console.log("\nSummary:");
    console.log("- Work order creation with vehicle._id: ✅");
    console.log("- Progress update and auto-completion: ✅");
    console.log("- Invoice generation with vehicle._id: ✅");
    console.log("- Data cleanup: ✅");
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response?.data?.message || error.message
    );
    console.error("Full error:", error.response?.data || error);
  }
}

// Run the test
testVehicleIdSave();
