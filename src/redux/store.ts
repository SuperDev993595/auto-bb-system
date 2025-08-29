import { configureStore } from "@reduxjs/toolkit";
import appointmentsReducer from "./reducer/appointmentsReducer";
import tasksReducer from "./actions/tasks";
import promotionsReducer from "./actions/promotions";
import marketingReducer from "./actions/marketing";
import customersReducer from "./reducer/customersReducer";
import servicesReducer from "./actions/services";
import remindersReducer from "./reducer/remindersReducer";
import inventoryReducer from "./reducer/inventoryReducer";
import invoicesReducer from "./reducer/invoicesReducer";
import dashboardReducer from "./actions/dashboard";
import adminReducer from "./actions/admin";
import emailReducer from "./actions/email";
import vehiclesReducer from "./actions/vehicles";
import communicationLogsReducer from "./reducer/communicationLogsReducer";
import smsReducer from "./actions/sms";
import chatReducer from "./actions/chat";
import salesRecordsReducer from "./reducer/salesRecordsReducer";

const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    tasks: tasksReducer,
    promotions: promotionsReducer,
    marketing: marketingReducer,
    customers: customersReducer,
    services: servicesReducer,
    reminders: remindersReducer,
    inventory: inventoryReducer,
    invoices: invoicesReducer,
    dashboard: dashboardReducer,
    admin: adminReducer,
    email: emailReducer,
    vehicles: vehiclesReducer,
    communicationLogs: communicationLogsReducer,
    sms: smsReducer,
    chat: chatReducer,
    salesRecords: salesRecordsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
