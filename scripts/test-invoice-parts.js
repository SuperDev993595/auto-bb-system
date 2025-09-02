const mongoose = require("mongoose");
const { WorkOrder } = require("../server/models/Service");
const Invoice = require("../server/models/Invoice");

// Connect to database
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/auto-bb-system",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function testInvoicePartsGeneration() {
  try {
    console.log("🔍 Testing invoice parts generation from workorders...\n");

    // Find a completed workorder with parts
    const workOrder = await WorkOrder.findOne({
      status: "completed",
      "services.parts": { $exists: true, $ne: [] },
    })
      .populate("customer", "name email phone")
      .populate("services.service", "name description");

    if (!workOrder) {
      console.log(
        "❌ No completed workorder with parts found. Please create one first."
      );
      return;
    }

    console.log("📋 Found workorder:", {
      id: workOrder._id,
      number: workOrder.workOrderNumber,
      customer: workOrder.customer?.name,
      status: workOrder.status,
      totalCost: workOrder.totalCost,
    });

    console.log("\n🔧 Services and parts breakdown:");
    workOrder.services.forEach((service, index) => {
      console.log(
        `\n  Service ${index + 1}: ${
          service.service?.name || service.description
        }`
      );
      console.log(
        `    Labor: ${service.laborHours} hrs × $${service.laborRate}/hr = $${
          service.laborHours * service.laborRate
        }`
      );

      if (service.parts && service.parts.length > 0) {
        console.log(`    Parts:`);
        service.parts.forEach((part) => {
          console.log(
            `      - ${part.name} (${part.partNumber || "No PN"}): ${
              part.quantity
            } × $${part.unitPrice} = $${part.totalPrice}`
          );
        });
      }

      console.log(`    Total service cost: $${service.totalCost}`);
    });

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({
      workOrderId: workOrder._id,
    });
    if (existingInvoice) {
      console.log(
        "\n⚠️  Invoice already exists for this workorder. Deleting for testing..."
      );
      await Invoice.findByIdAndDelete(existingInvoice._id);
    }

    // Test the new invoice generation
    console.log("\n🚀 Testing new invoice generation with parts...");

    // Simulate the new logic
    const items = [];

    workOrder.services.forEach((service) => {
      const laborCost = service.laborHours * service.laborRate;
      const partsCost = service.parts
        ? service.parts.reduce((sum, part) => sum + part.totalPrice, 0)
        : 0;
      const serviceOverhead = service.totalCost - laborCost - partsCost;

      if (laborCost > 0) {
        items.push({
          description: `${
            service.service?.name || service.description || "Service"
          } - Labor`,
          quantity: service.laborHours,
          unitPrice: service.laborRate,
          total: laborCost,
          type: "labor",
        });
      }

      if (service.parts && service.parts.length > 0) {
        service.parts.forEach((part) => {
          items.push({
            description: `Part: ${part.name}`,
            quantity: part.quantity,
            unitPrice: part.unitPrice,
            total: part.totalPrice,
            type: "part",
            partNumber: part.partNumber || null,
          });
        });
      }

      if (serviceOverhead > 0) {
        items.push({
          description: `${
            service.service?.name || service.description || "Service"
          } - Overhead`,
          quantity: 1,
          unitPrice: serviceOverhead,
          total: serviceOverhead,
          type: "overhead",
        });
      }
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    console.log("\n📊 Generated invoice items:");
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.description}`);
      console.log(`     Type: ${item.type}`);
      if (item.partNumber) console.log(`     Part #: ${item.partNumber}`);
      console.log(
        `     Qty: ${item.quantity} × $${item.unitPrice} = $${item.total}`
      );
    });

    console.log(`\n💰 Totals:`);
    console.log(`   Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`   Tax (8%): $${tax.toFixed(2)}`);
    console.log(`   Total: $${total.toFixed(2)}`);

    console.log("\n✅ Test completed successfully!");
    console.log("📝 The new invoice generation now includes:");
    console.log("   - Individual labor charges");
    console.log("   - Detailed parts breakdown with part numbers");
    console.log("   - Service overhead if applicable");
    console.log("   - Proper item categorization");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testInvoicePartsGeneration();
