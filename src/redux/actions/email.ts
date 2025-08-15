import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import emailService, {
  EmailTemplate,
  EmailCampaign,
  EmailData,
  EmailAnalytics
} from '../../services/email';

// Async thunks
export const fetchEmailTemplates = createAsyncThunk(
  'email/fetchEmailTemplates',
  async () => {
    const response = await emailService.getEmailTemplates();
    return response;
  }
);

export const createEmailTemplate = createAsyncThunk(
  'email/createEmailTemplate',
  async (templateData: any) => {
    const response = await emailService.createEmailTemplate(templateData);
    return response;
  }
);

export const updateEmailTemplate = createAsyncThunk(
  'email/updateEmailTemplate',
  async ({ id, templateData }: { id: string; templateData: any }) => {
    const response = await emailService.updateEmailTemplate(id, templateData);
    return response;
  }
);

export const deleteEmailTemplate = createAsyncThunk(
  'email/deleteEmailTemplate',
  async (id: string) => {
    await emailService.deleteEmailTemplate(id);
    return id;
  }
);

export const fetchEmailCampaigns = createAsyncThunk(
  'email/fetchEmailCampaigns',
  async () => {
    const response = await emailService.getEmailCampaigns();
    return response;
  }
);

export const createEmailCampaign = createAsyncThunk(
  'email/createEmailCampaign',
  async (campaignData: any) => {
    const response = await emailService.createEmailCampaign(campaignData);
    return response;
  }
);

export const sendEmailCampaign = createAsyncThunk(
  'email/sendEmailCampaign',
  async (id: string) => {
    const response = await emailService.sendEmailCampaign(id);
    return response;
  }
);

export const sendEmail = createAsyncThunk(
  'email/sendEmail',
  async (emailData: EmailData) => {
    const response = await emailService.sendEmail(emailData);
    return response;
  }
);

export const fetchEmailAnalytics = createAsyncThunk(
  'email/fetchEmailAnalytics',
  async () => {
    const response = await emailService.getEmailAnalytics();
    return response;
  }
);

// State interface
interface EmailState {
  // Email Templates
  templates: EmailTemplate[];
  templatesLoading: boolean;
  createTemplateLoading: boolean;
  updateTemplateLoading: boolean;
  deleteTemplateLoading: boolean;
  
  // Email Campaigns
  campaigns: EmailCampaign[];
  campaignsLoading: boolean;
  createCampaignLoading: boolean;
  sendCampaignLoading: boolean;
  
  // Email Sending
  sendEmailLoading: boolean;
  
  // Email Analytics
  analytics: EmailAnalytics | null;
  analyticsLoading: boolean;
  
  // Error handling
  error: string | null;
}

const initialState: EmailState = {
  templates: [],
  templatesLoading: false,
  createTemplateLoading: false,
  updateTemplateLoading: false,
  deleteTemplateLoading: false,
  
  campaigns: [],
  campaignsLoading: false,
  createCampaignLoading: false,
  sendCampaignLoading: false,
  
  sendEmailLoading: false,
  
  analytics: null,
  analyticsLoading: false,
  
  error: null,
};

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Email Templates
    builder
      .addCase(fetchEmailTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.error = null;
      })
      .addCase(fetchEmailTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchEmailTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.error = action.error.message || 'Failed to fetch email templates';
      });

    // Create Email Template
    builder
      .addCase(createEmailTemplate.pending, (state) => {
        state.createTemplateLoading = true;
        state.error = null;
      })
      .addCase(createEmailTemplate.fulfilled, (state, action) => {
        state.createTemplateLoading = false;
        state.templates.unshift(action.payload);
      })
      .addCase(createEmailTemplate.rejected, (state, action) => {
        state.createTemplateLoading = false;
        state.error = action.error.message || 'Failed to create email template';
      });

    // Update Email Template
    builder
      .addCase(updateEmailTemplate.pending, (state) => {
        state.updateTemplateLoading = true;
        state.error = null;
      })
      .addCase(updateEmailTemplate.fulfilled, (state, action) => {
        state.updateTemplateLoading = false;
        const index = state.templates.findIndex(template => template.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      })
      .addCase(updateEmailTemplate.rejected, (state, action) => {
        state.updateTemplateLoading = false;
        state.error = action.error.message || 'Failed to update email template';
      });

    // Delete Email Template
    builder
      .addCase(deleteEmailTemplate.pending, (state) => {
        state.deleteTemplateLoading = true;
        state.error = null;
      })
      .addCase(deleteEmailTemplate.fulfilled, (state, action) => {
        state.deleteTemplateLoading = false;
        state.templates = state.templates.filter(template => template.id !== action.payload);
      })
      .addCase(deleteEmailTemplate.rejected, (state, action) => {
        state.deleteTemplateLoading = false;
        state.error = action.error.message || 'Failed to delete email template';
      });

    // Fetch Email Campaigns
    builder
      .addCase(fetchEmailCampaigns.pending, (state) => {
        state.campaignsLoading = true;
        state.error = null;
      })
      .addCase(fetchEmailCampaigns.fulfilled, (state, action) => {
        state.campaignsLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchEmailCampaigns.rejected, (state, action) => {
        state.campaignsLoading = false;
        state.error = action.error.message || 'Failed to fetch email campaigns';
      });

    // Create Email Campaign
    builder
      .addCase(createEmailCampaign.pending, (state) => {
        state.createCampaignLoading = true;
        state.error = null;
      })
      .addCase(createEmailCampaign.fulfilled, (state, action) => {
        state.createCampaignLoading = false;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createEmailCampaign.rejected, (state, action) => {
        state.createCampaignLoading = false;
        state.error = action.error.message || 'Failed to create email campaign';
      });

    // Send Email Campaign
    builder
      .addCase(sendEmailCampaign.pending, (state) => {
        state.sendCampaignLoading = true;
        state.error = null;
      })
      .addCase(sendEmailCampaign.fulfilled, (state, action) => {
        state.sendCampaignLoading = false;
        const index = state.campaigns.findIndex(campaign => campaign.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(sendEmailCampaign.rejected, (state, action) => {
        state.sendCampaignLoading = false;
        state.error = action.error.message || 'Failed to send email campaign';
      });

    // Send Email
    builder
      .addCase(sendEmail.pending, (state) => {
        state.sendEmailLoading = true;
        state.error = null;
      })
      .addCase(sendEmail.fulfilled, (state) => {
        state.sendEmailLoading = false;
      })
      .addCase(sendEmail.rejected, (state, action) => {
        state.sendEmailLoading = false;
        state.error = action.error.message || 'Failed to send email';
      });

    // Fetch Email Analytics
    builder
      .addCase(fetchEmailAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchEmailAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchEmailAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.error.message || 'Failed to fetch email analytics';
      });
  },
});

export const { clearError } = emailSlice.actions;
export default emailSlice.reducer;
