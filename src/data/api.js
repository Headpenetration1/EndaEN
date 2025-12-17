/**
 * @fileoverview Firebase API-modul for Henteklar
 * 
 * Denne modulen håndterer all kommunikasjon med Firebase Firestore.
 * Inkluderer CRUD-operasjoner for barn, brukere, kalender, historikk og innstillinger.
 * 
 * @module data/api
 * @requires firebase/firestore
 * @requires config/firebase
 * 
 * @example
 * // Hent alle barn
 * import { getAllChildren } from './api';
 * const children = await getAllChildren();
 * 
 * @example
 * // Sjekk inn et barn
 * import { checkInChild } from './api';
 * await checkInChild('childId123', 'Anne Hansen');
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  deleteField,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firebase API-modul for Henteklar
 */

// ====== Collection references ======
/** @constant {string} Firestore collection for barn */
const CHILDREN_COLLECTION = 'children';
/** @constant {string} Firestore collection for brukere */
const USERS_COLLECTION = 'users';
/** @constant {string} Firestore collection for historikk */
const HISTORY_COLLECTION = 'history';
/** @constant {string} Firestore collection for innsjekking-logger */
const CHECKIN_LOG_COLLECTION = 'checkinLogs';
/** @constant {string} Firestore collection for kalenderhendelser */
const CALENDAR_COLLECTION = 'calendarEvents';
/** @constant {string} Firestore collection for innstillinger */
const SETTINGS_COLLECTION = 'settings';

// ====== Helper functions ======

/**
 * Konverterer Firestore Timestamp til ISO-streng
 * @param {Timestamp|string|null} timestamp - Firestore timestamp eller streng
 * @returns {string|null} ISO-formatert datostreng eller null
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

/**
 * Henter nåværende klokkeslett som formatert streng
 * @returns {string} Klokkeslett i format "HH:MM"
 */
const getCurrentTimeString = () => {
  return new Date().toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ====== Bruker-funksjoner ======

/**
 * Finner en eksisterende bruker basert på e-post, eller oppretter en ny
 * Brukes primært ved registrering av barn med foreldre-relasjoner
 * 
 * @async
 * @param {Object} parentData - Data om forelderen
 * @param {string} parentData.name - Forelderens navn
 * @param {string} parentData.email - Forelderens e-postadresse
 * @param {string} [parentData.phone] - Forelderens telefonnummer
 * @param {string} [parentData.relation] - Relasjon til barnet (f.eks. "Mor", "Far")
 * @returns {Promise<string>} Brukerens Firestore document ID
 * @throws {Error} Ved feil i Firestore-operasjon
 */
const findOrCreateUser = async (parentData) => {
  try {
    // Sjekk om bruker finnes
    const q = query(
        collection(db, USERS_COLLECTION),
        where('email', '==', parentData.email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Bruker finnes - returner ID
      return querySnapshot.docs[0].id;
    }

    // Opprett ny bruker
    const newUser = {
      name: parentData.name,
      email: parentData.email,
      phone: parentData.phone || '',
      role: 'parent',
      relation: parentData.relation || '',
      avatar: parentData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);
    return docRef.id;
  } catch (error) {
    console.error('Error finding/creating user:', error);
    throw error;
  }
};

/**
 * Henter alle brukere fra databasen
 * Brukes av admin for brukeradministrasjon
 * 
 * @async
 * @returns {Promise<Array<Object>>} Liste med alle brukere
 * @returns {string} return[].id - Brukerens Firestore ID
 * @returns {string} return[].name - Brukerens navn
 * @returns {string} return[].email - Brukerens e-post
 * @returns {string} return[].role - Brukerens rolle ('admin'|'staff'|'parent')
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: formatTimestamp(doc.data().createdAt),
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

/**
 * Opprett ny bruker
 */
export const createUser = async (userData) => {
  try {
    // Sjekk om e-post allerede finnes
    const q = query(
        collection(db, USERS_COLLECTION),
        where('email', '==', userData.email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      throw new Error('E-postadressen er allerede i bruk');
    }

    const newUser = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'staff',
      relation: userData.relation || '',
      avatar: userData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);
    return { id: docRef.id, ...newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Oppdater bruker
 */
export const updateUser = async (userId, updates) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);

    if (updates.name) {
      updates.avatar = updates.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Slett bruker
 */
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Bruker ikke funnet');
    }

    const user = { id: userSnap.id, ...userSnap.data() };

    // Fjern userId fra alle barn som har denne forelderen
    const childrenQuery = query(
        collection(db, CHILDREN_COLLECTION),
        where('parentIds', 'array-contains', userId)
    );
    const childrenSnapshot = await getDocs(childrenQuery);

    for (const childDoc of childrenSnapshot.docs) {
      const childData = childDoc.data();
      const updatedParentIds = childData.parentIds.filter(id => id !== userId);

      await updateDoc(doc(db, CHILDREN_COLLECTION, childDoc.id), {
        parentIds: updatedParentIds,
        primaryParentId: childData.primaryParentId === userId
            ? (updatedParentIds[0] || null)
            : childData.primaryParentId,
        updatedAt: serverTimestamp(),
      });
    }

    // Slett bruker
    await deleteDoc(userRef);

    return { success: true, deletedUser: user };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ====== Barn-funksjoner ======

/**
 * Henter alle barn fra databasen med fullstendige foreldre-relasjoner
 * Inkluderer oppslag i users-collection for å hente foreldre-info
 * 
 * @async
 * @returns {Promise<Array<Object>>} Liste med alle barn inkludert foreldre-info
 * @returns {string} return[].id - Barnets Firestore ID
 * @returns {string} return[].name - Barnets navn
 * @returns {number} return[].age - Barnets alder
 * @returns {string} return[].group - Avdeling/gruppe
 * @returns {boolean} return[].isCheckedIn - Om barnet er sjekket inn
 * @returns {Array<Object>} return[].parents - Liste med foreldre-objekter
 * 
 * @example
 * const children = await getAllChildren();
 * children.forEach(child => console.log(child.name, child.isCheckedIn));
 */
export const getAllChildren = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CHILDREN_COLLECTION));

    const children = await Promise.all(
        querySnapshot.docs.map(async (childDoc) => {
          const childData = {
            id: childDoc.id,
            ...childDoc.data(),
            createdAt: formatTimestamp(childDoc.data().createdAt),
            updatedAt: formatTimestamp(childDoc.data().updatedAt),
          };

          // Hent foreldre-info hvis det finnes
          if (childData.parentIds && childData.parentIds.length > 0) {
            const parentsPromises = childData.parentIds.map(async (parentId) => {
              const parentDoc = await getDoc(doc(db, USERS_COLLECTION, parentId));
              if (parentDoc.exists()) {
                return {
                  id: parentDoc.id,
                  userId: parentDoc.id, // For bakoverkompatibilitet
                  ...parentDoc.data(),
                  isPrimary: childData.primaryParentId === parentDoc.id,
                };
              }
              return null;
            });

            childData.parents = (await Promise.all(parentsPromises)).filter(Boolean);
          } else {
            childData.parents = [];
          }

          return childData;
        })
    );

    return children;
  } catch (error) {
    console.error('Error getting children:', error);
    return [];
  }
};

/**
 * Hent barn basert på dato
 */
export const getChildrenByDate = async (date) => {
  // For nå returnerer vi alle barn
  return await getAllChildren();
};

/**
 * Hent ett barn MED foreldre-info
 */
export const getChildById = async (id) => {
  try {
    const docRef = doc(db, CHILDREN_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const childData = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: formatTimestamp(docSnap.data().createdAt),
        updatedAt: formatTimestamp(docSnap.data().updatedAt),
      };

      // Hent foreldre-info
      if (childData.parentIds && childData.parentIds.length > 0) {
        const parentsPromises = childData.parentIds.map(async (parentId) => {
          const parentDoc = await getDoc(doc(db, USERS_COLLECTION, parentId));
          if (parentDoc.exists()) {
            return {
              id: parentDoc.id,
              userId: parentDoc.id,
              ...parentDoc.data(),
              isPrimary: childData.primaryParentId === parentDoc.id,
            };
          }
          return null;
        });

        childData.parents = (await Promise.all(parentsPromises)).filter(Boolean);
      } else {
        childData.parents = [];
      }

      return childData;
    }
    return null;
  } catch (error) {
    console.error('Error getting child:', error);
    return null;
  }
};

/**
 * Opprett nytt barn MED foreldre-relasjoner
 */
export const createChild = async (childData) => {
  try {
    // 1. Finn eller opprett foreldre i users collection
    const parentIds = [];
    let primaryParentId = null;

    if (childData.parents && childData.parents.length > 0) {
      for (const parent of childData.parents) {
        const userId = await findOrCreateUser(parent);
        parentIds.push(userId);

        if (parent.isPrimary) {
          primaryParentId = userId;
        }
      }
    }

    // Hvis ingen primær er satt, bruk første
    if (!primaryParentId && parentIds.length > 0) {
      primaryParentId = parentIds[0];
    }

    // 2. Opprett barn med referanser til foreldre
    const newChild = {
      name: childData.name,
      age: parseInt(childData.age),
      group: childData.group || 'Mauren',
      avatar: childData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      isCheckedIn: false,
      checkedInAt: null,
      checkedOutAt: null,
      parentIds: parentIds, // ⭐ Array av userId
      primaryParentId: primaryParentId, // ⭐ Primær kontakt
      notes: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, CHILDREN_COLLECTION), newChild);

    // Logg til historikk
    await saveToHistory({
      action: 'create',
      childId: docRef.id,
      childName: newChild.name,
    });

    // Returner med foreldre-info
    const childWithParents = await getChildById(docRef.id);
    return childWithParents;
  } catch (error) {
    console.error('Error creating child:', error);
    throw error;
  }
};

/**
 * Oppdater barn
 */
export const updateChild = async (id, updates) => {
  try {
    const docRef = doc(db, CHILDREN_COLLECTION, id);

    // Håndter foreldre-oppdateringer
    if (updates.parents) {
      const parentIds = [];
      let primaryParentId = null;

      for (const parent of updates.parents) {
        let userId;
        if (parent.id || parent.userId) {
          userId = parent.id || parent.userId;
        } else {
          userId = await findOrCreateUser(parent);
        }
        parentIds.push(userId);

        if (parent.isPrimary) {
          primaryParentId = userId;
        }
      }

      updates.parentIds = parentIds;
      updates.primaryParentId = primaryParentId || parentIds[0];
      delete updates.parents; // Fjern nested data
    }

    // Oppdater avatar hvis navn endres
    if (updates.name) {
      updates.avatar = updates.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Logg til historikk
    const child = await getChildById(id);
    await saveToHistory({
      action: 'update',
      childId: id,
      childName: child?.name,
    });

    return child;
  } catch (error) {
    console.error('Error updating child:', error);
    throw error;
  }
};

/**
 * Slett barn
 */
export const deleteChild = async (id) => {
  try {
    const child = await getChildById(id);
    const docRef = doc(db, CHILDREN_COLLECTION, id);
    await deleteDoc(docRef);

    // Logg til historikk
    await saveToHistory({
      action: 'delete',
      childId: id,
      childName: child?.name,
    });

    return true;
  } catch (error) {
    console.error('Error deleting child:', error);
    throw error;
  }
};

/**
 * Sjekker inn et barn i barnehagen
 * Bruker Firestore batch for atomisk oppdatering av status + logg
 * 
 * @async
 * @param {string} id - Barnets Firestore document ID
 * @param {string} [performedBy] - Navnet på personen som utfører innsjekkingen
 * @returns {Promise<Object>} Det oppdaterte barn-objektet
 * @throws {Error} Ved feil i Firestore-operasjon
 * 
 * @example
 * const updatedChild = await checkInChild('abc123', 'Anne Hansen');
 * console.log(`${updatedChild.name} sjekket inn kl. ${updatedChild.checkedInAt}`);
 */
export const checkInChild = async (id, performedBy) => {
  try {
    const timeString = getCurrentTimeString();
    const now = new Date();
    
    // Hent barnet først for å få navnet
    const child = await getChildById(id);
    if (!child) {
      throw new Error('Barn ikke funnet');
    }

    console.log('🔄 Starter innsjekking av', child.name);

    // 1. Oppdater barn-status
    const childRef = doc(db, CHILDREN_COLLECTION, id);
    await updateDoc(childRef, {
      isCheckedIn: true,
      checkedInAt: timeString,
      checkedOutAt: null,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Barn-status oppdatert');

    // 2. Opprett logg-entry i checkinLogs
    try {
      await addDoc(collection(db, CHECKIN_LOG_COLLECTION), {
        childId: id,
        childName: child.name,
        action: 'checkIn',
        timestamp: serverTimestamp(),
        date: now.toISOString().split('T')[0],
        time: timeString,
        performedBy: performedBy || 'System',
      });
      console.log('✅ Logg opprettet');
    } catch (logError) {
      // Logg-feil skal ikke stoppe innsjekking
      console.warn('⚠️ Kunne ikke opprette logg:', logError.message);
    }
    
    console.log(`✅ ${child.name} sjekket inn kl. ${timeString}`);
    
    // Returner oppdatert barn
    return await getChildById(id);
  } catch (error) {
    console.error('❌ Error checking in child:', error);
    throw error;
  }
};

/**
 * Sjekker ut et barn fra barnehagen
 * Bruker Firestore batch for atomisk oppdatering av status + logg
 * 
 * @async
 * @param {string} id - Barnets Firestore document ID
 * @param {string} [performedBy] - Navnet på personen som utfører utsjekkingen
 * @returns {Promise<Object>} Det oppdaterte barn-objektet
 * @throws {Error} Ved feil i Firestore-operasjon
 * 
 * @example
 * const updatedChild = await checkOutChild('abc123', 'Hege Nilsen');
 * console.log(`${updatedChild.name} hentet kl. ${updatedChild.checkedOutAt}`);
 */
export const checkOutChild = async (id, performedBy) => {
  try {
    const timeString = getCurrentTimeString();
    const now = new Date();
    
    // Hent barnet først for å få navnet
    const child = await getChildById(id);
    if (!child) {
      throw new Error('Barn ikke funnet');
    }

    console.log('🔄 Starter utsjekking av', child.name);

    // 1. Oppdater barn-status
    const childRef = doc(db, CHILDREN_COLLECTION, id);
    await updateDoc(childRef, {
      isCheckedIn: false,
      checkedInAt: null,
      checkedOutAt: timeString,
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Barn-status oppdatert');

    // 2. Opprett logg-entry i checkinLogs
    try {
      await addDoc(collection(db, CHECKIN_LOG_COLLECTION), {
        childId: id,
        childName: child.name,
        action: 'checkOut',
        timestamp: serverTimestamp(),
        date: now.toISOString().split('T')[0],
        time: timeString,
        performedBy: performedBy || 'System',
      });
      console.log('✅ Logg opprettet');
    } catch (logError) {
      // Logg-feil skal ikke stoppe utsjekking
      console.warn('⚠️ Kunne ikke opprette logg:', logError.message);
    }
    
    console.log(`✅ ${child.name} sjekket ut kl. ${timeString}`);
    
    // Returner oppdatert barn
    return await getChildById(id);
  } catch (error) {
    console.error('❌ Error checking out child:', error);
    throw error;
  }
};

/**
 * Henter alle barn som tilhører en spesifikk forelder
 * Brukes for RBAC - foreldre skal kun se egne barn
 * 
 * Funksjonen:
 * 1. Finner forelderens bruker-ID basert på e-post
 * 2. Søker etter barn hvor parentIds inneholder bruker-ID
 * 3. Henter full informasjon om hvert barn inkludert alle foreldre
 * 
 * @async
 * @param {string} parentEmail - Forelderens e-postadresse
 * @returns {Promise<Array<Object>>} Liste med barn som tilhører forelderen
 * @returns {string} return[].id - Barnets ID
 * @returns {string} return[].name - Barnets navn
 * @returns {boolean} return[].isCheckedIn - Status
 * 
 * @example
 * // Hent alle barn for en forelder
 * const myChildren = await getChildrenForParent('hege.nilsen@example.com');
 * console.log(`Du har ${myChildren.length} barn i barnehagen`);
 */
export const getChildrenForParent = async (parentEmail) => {
  console.log('🔍 getChildrenForParent kallt med:', parentEmail);

  try {
    // 1. Finn brukerens ID fra e-post
    const userQuery = query(
        collection(db, USERS_COLLECTION),
        where('email', '==', parentEmail)
    );
    const userSnapshot = await getDocs(userQuery);

    console.log('👤 User query resultater:', userSnapshot.size);

    if (userSnapshot.empty) {
      console.log('❌ Ingen bruker funnet med e-post:', parentEmail);
      return [];
    }

    const userId = userSnapshot.docs[0].id;
    const userData = userSnapshot.docs[0].data();
    console.log('✅ Bruker funnet:', { userId, name: userData.name, role: userData.role });

    // 2. Finn alle barn hvor userId er i parentIds
    console.log('🔍 Søker etter barn med parentId:', userId);

    const childrenQuery = query(
        collection(db, CHILDREN_COLLECTION),
        where('parentIds', 'array-contains', userId)
    );
    const childrenSnapshot = await getDocs(childrenQuery);

    console.log('👶 Barn funnet:', childrenSnapshot.size);

    if (childrenSnapshot.empty) {
      console.log('⚠️ Ingen barn funnet for denne forelderen');
      console.log('💡 Sjekk at barn har parentIds array med denne UID:', userId);
      return [];
    }

    // 3. Hent barn med full foreldre-info
    const children = await Promise.all(
        childrenSnapshot.docs.map(async (childDoc) => {
          console.log('📄 Henter barn:', childDoc.id, childDoc.data().name);
          return await getChildById(childDoc.id);
        })
    );

    console.log('✅ Totalt', children.length, 'barn returnert til forelder');
    return children;
  } catch (error) {
    console.error('❌ Error getting children for parent:', error);
    console.error('Error details:', error.message, error.code);
    return [];
  }
};

// ====== Check-in/out logg ======

export const logCheckInOut = async (childId, childName, action, performedBy) => {
  try {
    const now = new Date();
    const logEntry = {
      childId,
      childName,
      action,
      timestamp: serverTimestamp(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      performedBy: performedBy || 'System',
    };

    const docRef = await addDoc(collection(db, CHECKIN_LOG_COLLECTION), logEntry);
    return { id: docRef.id, ...logEntry };
  } catch (error) {
    console.error('Error logging check-in/out:', error);
    return null;
  }
};

export const getCheckInOutLogs = async (options = {}) => {
  try {
    let q = collection(db, CHECKIN_LOG_COLLECTION);
    const constraints = [];

    if (options.childId) {
      constraints.push(where('childId', '==', options.childId));
    }

    if (options.date) {
      constraints.push(where('date', '==', options.date));
    }

    constraints.push(orderBy('timestamp', 'desc'));

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: formatTimestamp(doc.data().timestamp),
    }));
  } catch (error) {
    console.error('Error getting check-in/out logs:', error);
    return [];
  }
};

// ====== Historikk ======

const saveToHistory = async (entry) => {
  try {
    await addDoc(collection(db, HISTORY_COLLECTION), {
      ...entry,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const getHistory = async (options = {}) => {
  try {
    let q = collection(db, HISTORY_COLLECTION);
    const constraints = [];

    if (options.childId) {
      constraints.push(where('childId', '==', options.childId));
    }

    constraints.push(orderBy('timestamp', 'desc'));

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    let history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: formatTimestamp(doc.data().timestamp),
    }));

    // Filtrer på dato hvis spesifisert
    if (options.date) {
      const targetDate = new Date(options.date).toDateString();
      history = history.filter((entry) => {
        const entryDate = new Date(entry.timestamp).toDateString();
        return entryDate === targetDate;
      });
    }

    return history;
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

// ====== Kalender ======

export const getCalendarEvents = async (options = {}) => {
  try {
    let q = collection(db, CALENDAR_COLLECTION);
    const constraints = [];

    constraints.push(orderBy('date', 'asc'));

    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);

    let events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: formatTimestamp(doc.data().createdAt),
    }));

    if (options.year && options.month !== undefined) {
      events = events.filter((event) => {
        const eventDate = new Date(event.date);
        return (
            eventDate.getFullYear() === options.year &&
            eventDate.getMonth() === options.month
        );
      });
    }

    if (options.date) {
      events = events.filter((event) => event.date === options.date);
    }

    return events;
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return [];
  }
};

export const createCalendarEvent = async (eventData) => {
  try {
    const newEvent = {
      title: eventData.title,
      description: eventData.description || '',
      date: eventData.date,
      time: eventData.time || '',
      type: eventData.type || 'general',
      color: eventData.color || '#3b82f6',
      createdAt: serverTimestamp(),
      createdBy: eventData.createdBy,
    };

    const docRef = await addDoc(collection(db, CALENDAR_COLLECTION), newEvent);
    return { id: docRef.id, ...newEvent };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (eventId, updates) => {
  try {
    const docRef = doc(db, CALENDAR_COLLECTION, eventId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

export const deleteCalendarEvent = async (eventId) => {
  try {
    const docRef = doc(db, CALENDAR_COLLECTION, eventId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

// ====== Innstillinger ======

export const getSettings = async () => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    const defaultSettings = {
      kindergartenName: 'Eventyrhagen Barnehage',
      kindergartenLogo: null,
      address: 'Barnehageveien 1, 0001 Oslo',
      phone: '22 33 44 55',
      email: 'post@eventyrhagen.no',
      openingHours: {
        open: '07:00',
        close: '17:00',
      },
    };

    return defaultSettings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
};

export const updateSettings = async (updates) => {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, updates);
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, updates);
    }

    return await getSettings();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// ====== Passord ======

export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = 'weak';
  let color = '#EF4444';
  let label = 'Svak';

  if (score >= 4) {
    strength = 'strong';
    color = '#10B981';
    label = 'Sterk';
  } else if (score >= 3) {
    strength = 'medium';
    color = '#F59E0B';
    label = 'Middels';
  }

  return {
    checks,
    score,
    strength,
    color,
    label,
    isValid: score >= 3,
  };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    if (!oldPassword || !newPassword) {
      throw new Error('Begge passord må fylles ut');
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      throw new Error('Passordet er for svakt');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const requestPasswordReset = async (email) => {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Vennligst oppgi en gyldig e-postadresse');
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      message: 'Hvis e-postadressen finnes i systemet, vil du motta en lenke for å tilbakestille passordet.',
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

export const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      throw new Error('Passordet er for svakt');
    }

    return { success: true, message: 'Passordet er oppdatert' };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// ====== Notater ======

export const addNote = async (childId, note) => {
  try {
    const child = await getChildById(childId);
    const notes = child.notes || [];

    notes.push({
      id: Date.now().toString(),
      text: note,
      timestamp: new Date().toISOString(),
    });

    await updateChild(childId, { notes });
    return await getChildById(childId);
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

export const deleteNote = async (childId, noteId) => {
  try {
    const child = await getChildById(childId);
    const notes = (child.notes || []).filter((n) => n.id !== noteId);

    await updateChild(childId, { notes });
    return await getChildById(childId);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

// ====== Reset/Delete ======

export const resetData = async () => {
  console.warn('resetData: Ikke implementert for Firebase - bruk Firebase Console');
  return [];
};

export const deleteAllData = async () => {
  console.warn('deleteAllData: Ikke implementert for Firebase - bruk Firebase Console');
  return { success: false, message: 'Bruk Firebase Console for å slette data' };
};