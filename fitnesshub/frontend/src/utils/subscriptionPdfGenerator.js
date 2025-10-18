import jsPDF from 'jspdf';

export const generateSubscriptionPDF = (subscriptionData, title = 'My Subscription') => {
    return new Promise((resolve) => {
        const doc = new jsPDF();
        
        // Check if it's a single subscription or multiple
        const isMultiple = Array.isArray(subscriptionData);
        const subscriptions = isMultiple ? subscriptionData : [subscriptionData];
        const pdfTitle = isMultiple ? title : `${subscriptionData.trainer.name} - Subscription Details`;
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(pdfTitle, 105, 20, { align: 'center' });
        
        // Add generation date and user info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        let yPosition = 45;

        subscriptions.forEach((subscription, index) => {
            // Add new page for each subscription after the first one
            if (index > 0) {
                doc.addPage();
                yPosition = 20;
            }

            // Subscription Overview
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text('Subscription Overview', 14, yPosition);
            yPosition += 10;

            // Trainer Information
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(`Trainer: ${subscription.trainer.name}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Specialization: ${subscription.trainer.specialization}`, 14, yPosition);
            yPosition += 6;
            doc.text(`Experience: ${subscription.trainer.experience} years`, 14, yPosition);
            yPosition += 10;

            // Subscription Plan Details
            doc.setFontSize(12);
            doc.setTextColor(40, 40, 40);
            doc.text('Subscription Plan:', 14, yPosition);
            yPosition += 6;
            doc.setFontSize(10);
            doc.text(`• ${subscription.subscriptionPlan.name}`, 20, yPosition);
            yPosition += 5;
            doc.text(`• Duration: ${subscription.subscriptionPlan.duration} days`, 20, yPosition);
            yPosition += 5;
            doc.text(`• Amount: $${subscription.amount}`, 20, yPosition);
            yPosition += 5;
            doc.text(`• Status: ${subscription.status}`, 20, yPosition);
            yPosition += 5;
            doc.text(`• Payment: ${subscription.paymentStatus}`, 20, yPosition);
            yPosition += 10;

            // Plan Features
            if (subscription.subscriptionPlan.features && subscription.subscriptionPlan.features.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Plan Features:', 14, yPosition);
                yPosition += 6;
                
                subscription.subscriptionPlan.features.forEach(feature => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.setFontSize(9);
                    doc.text(`✓ ${feature}`, 20, yPosition);
                    yPosition += 5;
                });
                yPosition += 5;
            }

            // Timeline
            doc.setFontSize(12);
            doc.setTextColor(40, 40, 40);
            doc.text('Subscription Timeline:', 14, yPosition);
            yPosition += 6;
            doc.setFontSize(10);
            doc.text(`• Start Date: ${new Date(subscription.startDate).toLocaleDateString()}`, 20, yPosition);
            yPosition += 5;
            doc.text(`• End Date: ${new Date(subscription.endDate).toLocaleDateString()}`, 20, yPosition);
            yPosition += 5;
            
            const daysRemaining = Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            doc.text(`• Days Remaining: ${daysRemaining > 0 ? daysRemaining : 'Expired'}`, 20, yPosition);
            yPosition += 10;

            // Diet Plans
            if (subscription.trainerDietPlans && subscription.trainerDietPlans.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Diet Plans:', 14, yPosition);
                yPosition += 8;

                subscription.trainerDietPlans.forEach(plan => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    doc.text(`• ${plan.title} - $${plan.price}`, 20, yPosition);
                    yPosition += 5;
                    
                    doc.setFontSize(8);
                    doc.text(`  Duration: ${plan.duration} weeks | Calories: ${plan.caloriesPerDay}/day`, 20, yPosition);
                    yPosition += 4;
                    doc.text(`  Target: ${plan.targetAudience}`, 20, yPosition);
                    yPosition += 6;

                    // Meals
                    if (plan.meals && plan.meals.length > 0) {
                        doc.setFontSize(8);
                        doc.setTextColor(80, 80, 80);
                        plan.meals.forEach(meal => {
                            if (yPosition > 270) {
                                doc.addPage();
                                yPosition = 20;
                            }
                            doc.text(`  🍽️ ${meal.mealType}: ${meal.description} (${meal.calories} cal)`, 25, yPosition);
                            yPosition += 4;
                        });
                        yPosition += 2;
                    }
                    yPosition += 4;
                });
                yPosition += 5;
            }

            // Workout Plans
            if (subscription.trainerWorkoutPlans && subscription.trainerWorkoutPlans.length > 0) {
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Workout Plans:', 14, yPosition);
                yPosition += 8;

                subscription.trainerWorkoutPlans.forEach(plan => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(60, 60, 60);
                    doc.text(`• ${plan.title} - $${plan.price}`, 20, yPosition);
                    yPosition += 5;
                    
                    doc.setFontSize(8);
                    doc.text(`  Duration: ${plan.duration} weeks | Difficulty: ${plan.difficulty}`, 20, yPosition);
                    yPosition += 4;
                    doc.text(`  Target: ${plan.targetAudience}`, 20, yPosition);
                    yPosition += 6;

                    // Exercises
                    if (plan.exercises && plan.exercises.length > 0) {
                        doc.setFontSize(8);
                        doc.setTextColor(80, 80, 80);
                        plan.exercises.forEach(exercise => {
                            if (yPosition > 270) {
                                doc.addPage();
                                yPosition = 20;
                            }
                            doc.text(`  💪 ${exercise.name}: ${exercise.sets} sets × ${exercise.reps} reps`, 25, yPosition);
                            yPosition += 4;
                            if (exercise.description) {
                                doc.text(`    ${exercise.description}`, 25, yPosition);
                                yPosition += 4;
                            }
                            doc.text(`    Rest: ${exercise.restTime}s`, 25, yPosition);
                            yPosition += 4;
                        });
                        yPosition += 2;
                    }
                    yPosition += 4;
                });
            }

            // Payment Information
            if (subscription.transactionId) {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text('Payment Information:', 14, yPosition);
                yPosition += 6;
                doc.setFontSize(9);
                doc.text(`Transaction ID: ${subscription.transactionId}`, 20, yPosition);
                yPosition += 5;
                doc.text(`Subscription Date: ${new Date(subscription.createdAt).toLocaleString()}`, 20, yPosition);
                yPosition += 10;
            }

            // Add separator for multiple subscriptions
            if (isMultiple && index < subscriptions.length - 1) {
                doc.setDrawColor(200, 200, 200);
                doc.line(14, yPosition, 196, yPosition);
                yPosition += 15;
            }
        });

        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        // Save the PDF
        const fileName = isMultiple 
            ? `My_Subscriptions_${new Date().getTime()}.pdf`
            : `Subscription_${subscriptions[0].trainer.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        
        doc.save(fileName);
        resolve();
    });
};