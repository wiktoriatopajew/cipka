import { IStorage } from './storage';
import { Parser } from 'json2csv';

export class ExportService {
  constructor(private storage: IStorage) {}

  async exportUsers(format: 'csv' | 'json' = 'csv') {
    try {
      const users = await this.storage.getAllUsers();
      const exportData = users
        .filter(user => !user.isAdmin)
        .map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          hasSubscription: user.hasSubscription,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt
        }));

      if (format === 'csv') {
        const fields = ['id', 'username', 'email', 'hasSubscription', 'isOnline', 'lastSeen', 'createdAt'];
        const parser = new Parser({ fields });
        return {
          data: parser.parse(exportData),
          filename: `users-export-${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv'
        };
      }

      return {
        data: JSON.stringify(exportData, null, 2),
        filename: `users-export-${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json'
      };
    } catch (error) {
      throw new Error('Failed to export users data');
    }
  }

  async exportChatSessions(startDate?: string, endDate?: string, format: 'csv' | 'json' = 'csv') {
    try {
      const sessions = await this.storage.getAllActiveChatSessions();
      let exportData = sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        vehicleInfo: session.vehicleInfo,
        status: session.status,
        messageCount: session.messageCount || 0,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity || session.createdAt
      }));

      // Filter by date range if provided
      if (startDate) {
        exportData = exportData.filter(session => 
          new Date(session.createdAt) >= new Date(startDate)
        );
      }
      if (endDate) {
        exportData = exportData.filter(session => 
          new Date(session.createdAt) <= new Date(endDate)
        );
      }

      if (format === 'csv') {
        const fields = ['id', 'userId', 'vehicleInfo', 'status', 'messageCount', 'createdAt', 'lastActivity'];
        const parser = new Parser({ fields });
        return {
          data: parser.parse(exportData),
          filename: `chat-sessions-export-${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv'
        };
      }

      return {
        data: JSON.stringify(exportData, null, 2),
        filename: `chat-sessions-export-${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json'
      };
    } catch (error) {
      throw new Error('Failed to export chat sessions data');
    }
  }

  async exportMessages(sessionId?: string, format: 'csv' | 'json' = 'csv') {
    try {
      let messages;
      if (sessionId) {
        messages = await this.storage.getSessionMessages(sessionId);
      } else {
        messages = await this.storage.getRecentMessages(1000); // Last 1000 messages
      }

      const exportData = messages.map(message => ({
        id: message.id,
        sessionId: message.sessionId,
        senderType: message.senderType,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt
      }));

      if (format === 'csv') {
        const fields = ['id', 'sessionId', 'senderType', 'content', 'isRead', 'createdAt'];
        const parser = new Parser({ fields });
        return {
          data: parser.parse(exportData),
          filename: `messages-export-${sessionId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`,
          contentType: 'text/csv'
        };
      }

      return {
        data: JSON.stringify(exportData, null, 2),
        filename: `messages-export-${sessionId || 'all'}-${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json'
      };
    } catch (error) {
      throw new Error('Failed to export messages data');
    }
  }

  async generateFinancialReport(startDate?: string, endDate?: string) {
    try {
      const subscriptions = await this.storage.getAllActiveSubscriptions();
      let filteredSubs = subscriptions;

      // Filter by date range if provided
      if (startDate) {
        filteredSubs = filteredSubs.filter(sub => 
          new Date(sub.createdAt) >= new Date(startDate)
        );
      }
      if (endDate) {
        filteredSubs = filteredSubs.filter(sub => 
          new Date(sub.createdAt) <= new Date(endDate)
        );
      }

      const totalRevenue = filteredSubs.reduce((sum, sub) => sum + parseFloat(sub.amount || "0"), 0);
      const totalTransactions = filteredSubs.length;
      const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Group by date for daily breakdown
      const dailyBreakdown = filteredSubs.reduce((acc, sub) => {
        const date = new Date(sub.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { count: 0, revenue: 0 };
        }
        acc[date].count++;
        acc[date].revenue += parseFloat(sub.amount || "0");
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      const reportData = {
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransaction,
          periodStart: startDate || 'All time',
          periodEnd: endDate || 'All time',
          generatedAt: new Date().toISOString()
        },
        dailyBreakdown: Object.entries(dailyBreakdown).map(([date, data]) => ({
          date,
          transactions: data.count,
          revenue: data.revenue
        })),
        transactions: filteredSubs.map(sub => ({
          id: sub.id,
          userId: sub.userId,
          amount: sub.amount,
          createdAt: sub.createdAt
        }))
      };

      return {
        data: JSON.stringify(reportData, null, 2),
        filename: `financial-report-${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json'
      };
    } catch (error) {
      throw new Error('Failed to generate financial report');
    }
  }
}
