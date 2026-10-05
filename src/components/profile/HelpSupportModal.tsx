import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../../theme';
import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';
import { SupportTicket } from '../../types';

interface HelpSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    q: 'How does daily broker token auto-refresh work?',
    a: 'Broker tokens in India expire every 24 hours per SEBI 2FA rules. Tradetron automatically uses your configured TOTP & API Secret to refresh your session before 08:30 AM every morning.',
  },
  {
    q: 'What happens when I hit the Emergency Kill Switch?',
    a: 'The Kill Switch instantly sends market square-off orders to cancel all pending limit/SL orders and exit all open intraday strategy legs across connected brokers.',
  },
  {
    q: 'Can I route signals from TradingView PineScript or Python?',
    a: 'Yes! Use our Webhook Engine in the Analytics/Strategy screen. Send an HTTP POST payload with your strategy secret to trigger sub-second multi-broker execution.',
  },
  {
    q: 'How are creator marketplace revenues paid out?',
    a: 'Creator earnings are held in escrow and settled automatically via IMPS to your linked bank account on the 1st and 15th of every month, or instantly upon request in Creator Studio.',
  },
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({
  visible,
  onClose,
}) => {
  const supportTickets = useAppStore((state) => state.supportTickets);
  const createSupportTicket = useAppStore((state) => state.createSupportTicket);
  const addTicketMessage = useAppStore((state) => state.addTicketMessage);

  const [activeTab, setActiveTab] = useState<'FAQ' | 'TICKETS' | 'NEW_TICKET'>('FAQ');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New Ticket Form State
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('BROKER_API');
  const [ticketPriority, setTicketPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const handleCreateTicket = () => {
    if (!ticketSubject.trim()) {
      Alert.alert('Subject Required', 'Please enter a ticket subject.');
      return;
    }
    if (!ticketMessage.trim()) {
      Alert.alert('Details Required', 'Please explain your query or issue.');
      return;
    }

    createSupportTicket({
      category: ticketCategory,
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
      priority: ticketPriority,
    });

    setTicketSubject('');
    setTicketMessage('');
    setActiveTab('TICKETS');
    Alert.alert('Ticket Raised', 'Your support ticket has been submitted. Our Quant team will respond shortly.');
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim()) return;
    addTicketMessage(ticketId, replyText.trim());
    setReplyText('');
  };

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="headset" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>24/7 Help & Support Desk</Text>
                <Text style={styles.headerSubtitle}>Algorithmic trading assistance & FAQ</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="x" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'FAQ' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('FAQ');
                setSelectedTicketId(null);
              }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'FAQ' && styles.tabBtnTextActive]}>
                FAQ & Knowledge Base
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TICKETS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('TICKETS')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'TICKETS' && styles.tabBtnTextActive]}>
                My Tickets ({supportTickets.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'NEW_TICKET' && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab('NEW_TICKET');
                setSelectedTicketId(null);
              }}
            >
              <Text style={[styles.tabBtnText, activeTab === 'NEW_TICKET' && styles.tabBtnTextActive]}>
                + Raise Ticket
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollBody} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* FAQ TAB */}
            {activeTab === 'FAQ' && (
              <View style={styles.faqList}>
                {FAQS.map((faq, index) => {
                  const isExpanded = expandedFaqIndex === index;
                  return (
                    <Card key={index} style={styles.faqCard} variant="glass">
                      <TouchableOpacity
                        style={styles.faqHeader}
                        onPress={() => setExpandedFaqIndex(isExpanded ? null : index)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.faqQuestion}>{faq.q}</Text>
                        <Feather
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      {isExpanded && (
                        <View style={styles.faqAnswerBox}>
                          <Text style={styles.faqAnswerText}>{faq.a}</Text>
                        </View>
                      )}
                    </Card>
                  );
                })}

                <Card style={styles.emergencyContactCard} variant="blueGlass">
                  <View style={styles.emergencyRow}>
                    <MaterialCommunityIcons name="phone-alert" size={22} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.emergencyTitle}>Desk Emergency Desk Support</Text>
                      <Text style={styles.emergencySub}>For execution halts or broker API down incidents</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.callDeskBtn}
                      onPress={() => Alert.alert('Support Helpline', 'Toll-free 24/7 Trading Desk: +91 (022) 6890 4500')}
                    >
                      <Text style={styles.callDeskBtnText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </View>
            )}

            {/* MY TICKETS TAB */}
            {activeTab === 'TICKETS' && (
              <>
                {selectedTicket ? (
                  <View style={styles.ticketDetailView}>
                    <TouchableOpacity 
                      style={styles.backToTicketsBtn}
                      onPress={() => setSelectedTicketId(null)}
                    >
                      <Feather name="arrow-left" size={14} color={Colors.primary} />
                      <Text style={styles.backToTicketsText}>Back to All Tickets</Text>
                    </TouchableOpacity>

                    <Card style={styles.ticketDetailCard} variant="blueGlass">
                      <View style={styles.ticketTopRow}>
                        <Text style={styles.ticketIdBadge}>#{selectedTicket.id}</Text>
                        <View style={[
                          styles.ticketStatusBadge,
                          selectedTicket.status === 'RESOLVED' ? styles.statusResolved : styles.statusOpen
                        ]}>
                          <Text style={[
                            styles.ticketStatusText,
                            selectedTicket.status === 'RESOLVED' ? styles.statusTextResolved : styles.statusTextOpen
                          ]}>
                            {selectedTicket.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.ticketSubjectText}>{selectedTicket.subject}</Text>
                      <Text style={styles.ticketMessageText}>{selectedTicket.message}</Text>
                      <Text style={styles.ticketDateText}>Created {selectedTicket.createdAt} • Category: {selectedTicket.category}</Text>
                    </Card>

                    <Text style={styles.conversationHeader}>Desk Response History</Text>
                    
                    {selectedTicket.responses?.map((resp) => (
                      <View 
                        key={resp.id} 
                        style={[
                          styles.chatBubble, 
                          resp.sender === 'USER' ? styles.userBubble : styles.supportBubble
                        ]}
                      >
                        <View style={styles.chatSenderRow}>
                          <Text style={styles.chatSenderName}>
                            {resp.sender === 'USER' ? 'You (Trader)' : 'Tradetron Quant Desk (AI Assistant)'}
                          </Text>
                          <Text style={styles.chatTime}>{resp.timestamp}</Text>
                        </View>
                        <Text style={styles.chatText}>{resp.text}</Text>
                      </View>
                    ))}

                    {/* Reply Input Box */}
                    <View style={styles.replyBox}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Write a message to support desk..."
                        placeholderTextColor={Colors.textTertiary}
                        value={replyText}
                        onChangeText={setReplyText}
                      />
                      <TouchableOpacity 
                        style={styles.sendReplyBtn}
                        onPress={() => handleSendReply(selectedTicket.id)}
                      >
                        <Feather name="send" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.ticketsList}>
                    {supportTickets.map((t) => (
                      <Card key={t.id} style={styles.ticketCard} variant="glass">
                        <TouchableOpacity 
                          onPress={() => setSelectedTicketId(t.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.ticketTopRow}>
                            <View style={styles.ticketLeftHeader}>
                              <Text style={styles.ticketIdBadge}>#{t.id}</Text>
                              <View style={styles.priorityBadge}>
                                <Text style={styles.priorityBadgeText}>{t.priority} PRIORITY</Text>
                              </View>
                            </View>

                            <View style={[
                              styles.ticketStatusBadge,
                              t.status === 'RESOLVED' ? styles.statusResolved : styles.statusOpen
                            ]}>
                              <Text style={[
                                styles.ticketStatusText,
                                t.status === 'RESOLVED' ? styles.statusTextResolved : styles.statusTextOpen
                              ]}>
                                {t.status}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.ticketSubject}>{t.subject}</Text>
                          <Text style={styles.ticketSnippet} numberOfLines={2}>{t.message}</Text>

                          <View style={styles.ticketFooter}>
                            <Text style={styles.ticketDate}>{t.createdAt}</Text>
                            <View style={styles.ticketResponsesCount}>
                              <Feather name="message-square" size={11} color={Colors.primary} />
                              <Text style={styles.ticketResponsesText}>{t.responses?.length || 0} messages</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </Card>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* RAISE NEW TICKET TAB */}
            {activeTab === 'NEW_TICKET' && (
              <View style={styles.newTicketForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issue Category</Text>
                  <View style={styles.categoryPillsRow}>
                    {(['BROKER_API', 'ORDER_EXECUTION', 'WEBHOOK', 'BILLING', 'STRATEGY_BUILDER'] as const).map((cat) => {
                      const isSelected = ticketCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.catPill, isSelected && styles.catPillActive]}
                          onPress={() => setTicketCategory(cat)}
                        >
                          <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                            {cat.replace('_', ' ')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Priority Level</Text>
                  <View style={styles.priorityPillsRow}>
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => {
                      const isSelected = ticketPriority === p;
                      return (
                        <TouchableOpacity
                          key={p}
                          style={[styles.priorityPill, isSelected && styles.priorityPillActive]}
                          onPress={() => setTicketPriority(p)}
                        >
                          <Text style={[styles.priorityPillText, isSelected && styles.priorityPillTextActive]}>
                            {p}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Subject *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Brief summary of the issue..."
                    placeholderTextColor={Colors.textTertiary}
                    value={ticketSubject}
                    onChangeText={setTicketSubject}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Detailed Description *</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Include deployment ID, strategy name, error message, or log timestamp..."
                    placeholderTextColor={Colors.textTertiary}
                    value={ticketMessage}
                    onChangeText={setTicketMessage}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.submitTicketBtn}
                  onPress={handleCreateTicket}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.submitTicketBtnText}>Submit Support Ticket</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  tabBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 10,
  },
  faqList: {
    gap: 8,
  },
  faqCard: {
    padding: 12,
    borderRadius: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  faqAnswerBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  emergencyContactCard: {
    padding: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emergencySub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  callDeskBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  callDeskBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ticketsList: {
    gap: 8,
  },
  ticketCard: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketIdBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  priorityBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ticketStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusResolved: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusOpen: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  ticketStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statusTextResolved: {
    color: Colors.accentGreen,
  },
  statusTextOpen: {
    color: '#D97706',
  },
  ticketSubject: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  ticketSnippet: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
    marginTop: 2,
  },
  ticketDate: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  ticketResponsesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketResponsesText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  ticketDetailView: {
    gap: 10,
  },
  backToTicketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  backToTicketsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  ticketDetailCard: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  ticketSubjectText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ticketMessageText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  ticketDateText: {
    fontSize: 9.5,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  conversationHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-end',
    width: '90%',
  },
  supportBubble: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    alignSelf: 'flex-start',
    width: '90%',
  },
  chatSenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatSenderName: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chatTime: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  chatText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  replyBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 11.5,
    color: Colors.textPrimary,
  },
  sendReplyBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTicketForm: {
    gap: 10,
  },
  formGroup: {
    gap: 4,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priorityPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priorityPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priorityPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitTicketBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.button,
    marginTop: 4,
  },
  submitTicketBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
