import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import './PDFGenerator.css';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #3B82F6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    padding: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    border: '1pt solid #E2E8F0',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 5,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 5,
    backgroundColor: '#F8FAFC',
  },
  exerciseItem: {
    marginBottom: 8,
    padding: 5,
    border: '1pt solid #E2E8F0',
    borderRadius: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 10,
  },
});

// Diet Plan PDF Document
const DietPlanPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>
          Created by: {data.trainerName} | Duration: {data.duration} weeks | 
          Calories: {data.caloriesPerDay}/day | Target: {data.targetAudience}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan Description</Text>
        <Text style={{ fontSize: 11, lineHeight: 1.5 }}>{data.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.duration}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.caloriesPerDay}</Text>
            <Text style={styles.statLabel}>Calories/Day</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>LKR{data.price}</Text>
            <Text style={styles.statLabel}>Price</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Meal Plan</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Meal Type</Text>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Calories</Text>
          </View>
          {data.meals.map((meal, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{meal.mealType}</Text>
              <Text style={styles.tableCell}>{meal.description}</Text>
              <Text style={styles.tableCell}>{meal.calories}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} • FitnessHub Trainer Dashboard</Text>
      </View>
    </Page>
  </Document>
);

// Workout Plan PDF Document
const WorkoutPlanPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>
          Created by: {data.trainerName} | Duration: {data.duration} weeks | 
          Difficulty: {data.difficulty} | Target: {data.targetAudience}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan Description</Text>
        <Text style={{ fontSize: 11, lineHeight: 1.5 }}>{data.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.duration}</Text>
            <Text style={styles.statLabel}>Weeks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>LKR{data.price}</Text>
            <Text style={styles.statLabel}>Price</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Routine</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Exercise</Text>
            <Text style={styles.tableCell}>Sets</Text>
            <Text style={styles.tableCell}>Reps</Text>
            <Text style={styles.tableCell}>Rest (sec)</Text>
            <Text style={styles.tableCell}>Description</Text>
          </View>
          {data.exercises.map((exercise, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{exercise.name}</Text>
              <Text style={styles.tableCell}>{exercise.sets}</Text>
              <Text style={styles.tableCell}>{exercise.reps}</Text>
              <Text style={styles.tableCell}>{exercise.restTime}</Text>
              <Text style={styles.tableCell}>{exercise.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} • FitnessHub Trainer Dashboard</Text>
      </View>
    </Page>
  </Document>
);

// Subscribers Report PDF Document
const SubscribersReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscribers Report</Text>
        <Text style={styles.subtitle}>
          Generated by: {data.generatedBy} | Date: {data.generatedAt} | 
          Total Subscribers: {data.subscribers.length}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics Summary</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.statistics.totalSubscribers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.statistics.activeSubscribers}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>LKR{data.statistics.totalRevenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscribers List</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Client</Text>
            <Text style={styles.tableCell}>Plan</Text>
            <Text style={styles.tableCell}>Amount</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>End Date</Text>
          </View>
          {data.subscribers.map((sub, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{sub.user.name}</Text>
              <Text style={styles.tableCell}>{sub.subscriptionPlan.name}</Text>
              <Text style={styles.tableCell}>LKR{sub.amount}</Text>
              <Text style={styles.tableCell}>{sub.status}</Text>
              <Text style={styles.tableCell}>
                {new Date(sub.endDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} • FitnessHub Trainer Dashboard</Text>
      </View>
    </Page>
  </Document>
);

// Dashboard Report PDF Document
const DashboardReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Report</Text>
        <Text style={styles.subtitle}>
          Generated by: {data.generatedBy} | Date: {data.generatedAt}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Overview</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.statistics.totalSubscribers}</Text>
            <Text style={styles.statLabel}>Total Subscribers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.statistics.activeSubscribers}</Text>
            <Text style={styles.statLabel}>Active Subscribers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>LKR{data.statistics.totalRevenue}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plans Summary</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.dietPlans}</Text>
            <Text style={styles.statLabel}>Diet Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.workoutPlans}</Text>
            <Text style={styles.statLabel}>Workout Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{data.totalPlans}</Text>
            <Text style={styles.statLabel}>Total Plans</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} • FitnessHub Trainer Dashboard</Text>
      </View>
    </Page>
  </Document>
);

// All Plans PDF Documents
const AllDietPlansPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>All Diet Plans Report</Text>
        <Text style={styles.subtitle}>
          Generated on: {data.generatedAt} | Total Plans: {data.totalPlans}
        </Text>
      </View>

      {data.plans.map((plan, index) => (
        <View key={index} style={[styles.section, { marginBottom: 20, pageBreak: 'before' }]} wrap={false}>
          <Text style={styles.sectionTitle}>{plan.title}</Text>
          <Text style={{ fontSize: 11, marginBottom: 10 }}>{plan.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>{plan.duration}</Text>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>{plan.caloriesPerDay}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>{plan.meals.length}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>LKR{plan.price}</Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} • FitnessHub Trainer Dashboard</Text>
      </View>
    </Page>
  </Document>
);

const AllWorkoutPlansPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>All Workout Plans Report</Text>
        <Text style={styles.subtitle}>
          Generated on: {data.generatedAt} | Total Plans: {data.totalPlans}
        </Text>
      </View>

      {data.plans.map((plan, index) => (
        <View key={index} style={[styles.section, { marginBottom: 20, pageBreak: 'before' }]} wrap={false}>
          <Text style={styles.sectionTitle}>{plan.title}</Text>
          <Text style={{ fontSize: 11, marginBottom: 10 }}>{plan.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>{plan.duration}</Text>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>{plan.difficulty}</Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>{plan.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={[styles.statCard, { marginHorizontal: 2 }]}>
              <Text style={styles.statNumber}>LKR{plan.price}</Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()} • FitnessHub Trainer Dashboard</Text>
      </View>
    </Page>
  </Document>
);

const PDFGenerator = ({ type, data, onClose }) => {
  const getPDFDocument = () => {
    const enhancedData = {
      ...data,
      trainerName: 'Trainer', // You can replace this with actual trainer name from context
      generatedAt: new Date().toLocaleDateString()
    };

    switch (type) {
      case 'diet':
        return <DietPlanPDF data={enhancedData} />;
      case 'workout':
        return <WorkoutPlanPDF data={enhancedData} />;
      case 'subscribers':
        return <SubscribersReportPDF data={enhancedData} />;
      case 'dashboard':
        return <DashboardReportPDF data={enhancedData} />;
      case 'all-diets':
        return <AllDietPlansPDF data={enhancedData} />;
      case 'all-workouts':
        return <AllWorkoutPlansPDF data={enhancedData} />;
      default:
        return null;
    }
  };

  const getFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    switch (type) {
      case 'diet':
        return `diet-plan-${data.title}-${date}.pdf`;
      case 'workout':
        return `workout-plan-${data.title}-${date}.pdf`;
      case 'subscribers':
        return `subscribers-report-${date}.pdf`;
      case 'dashboard':
        return `dashboard-report-${date}.pdf`;
      case 'all-diets':
        return `all-diet-plans-${date}.pdf`;
      case 'all-workouts':
        return `all-workout-plans-${date}.pdf`;
      default:
        return `report-${date}.pdf`;
    }
  };

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-content">
        <div className="pdf-modal-header">
          <h3>Generate PDF</h3>
          <button className="pdf-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="pdf-preview-info">
          <p>Your PDF document is ready for download.</p>
          <p>
            <strong>Document Type:</strong> {
              type === 'diet' ? 'Diet Plan' :
              type === 'workout' ? 'Workout Plan' :
              type === 'subscribers' ? 'Subscribers Report' :
              type === 'dashboard' ? 'Dashboard Report' :
              type === 'all-diets' ? 'All Diet Plans' :
              type === 'all-workouts' ? 'All Workout Plans' : 'Report'
            }
          </p>
        </div>

        <div className="pdf-download-section">
          <PDFDownloadLink
            document={getPDFDocument()}
            fileName={getFileName()}
            className="pdf-download-btn"
          >
            {({ loading, error }) =>
              loading ? 'Preparing PDF...' : error ? 'Error generating PDF' : '📥 Download PDF'
            }
          </PDFDownloadLink>
          
          <button className="pdf-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;