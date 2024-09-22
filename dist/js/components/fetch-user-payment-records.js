import { app } from '/src/firebase/firebase-config.js';
import { getFirestore, collection, query, where, orderBy, getDocs } from "firebase/firestore";

const db = getFirestore(app);

export async function fetchPaymentRecords(uid, pageNumber = 1, pageSize = 10) {
  try {
    // Create a reference to the 'payments' collection and filter by uid, ordering by 'paidAt'
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('uid', '==', uid), orderBy('paidAt', 'desc'));

    // Fetch the documents based on the query
    const snapshot = await getDocs(q);
    const payments = [];

    snapshot.forEach(doc => {
      payments.push({
        paymentId: doc.data().paymentId, // Use doc.id for document ID
        reference: doc.data().reference,
        purpose: doc.data().paymentPurpose,
        status: doc.data().status,
        date: doc.data().paidAt
      });
    });

    // Implement pagination (10 records per page)
    const start = (pageNumber - 1) * pageSize;
    const end = pageNumber * pageSize;

    return payments.slice(start, end); // Return only the records for the current page
  } catch (error) {
    console.error('Error fetching payment records:', error);
  }

}

export async function getTotalPaymentRecords(uid) {
  const paymentsRef = collection(db, 'payments');
  const q = query(paymentsRef, where('uid', '==', uid));
  const snapshot = await getDocs(q);
  return snapshot.size; // This returns the total number of records
}
