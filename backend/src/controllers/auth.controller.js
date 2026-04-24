import { auth, db } from '../firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from 'firebase/auth';

export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const assignedRole = role || 'student';

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user securely entirely within Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      role: assignedRole,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        uid: user.uid,
        email: user.email,
        role: assignedRole
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred during signup'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user document from Firestore to retrieve authoritative role
    let role = 'student'; // Fallback role
    try {
      const userDocSnap = await db.collection('users').doc(user.uid).get();

      if (userDocSnap.exists) {
        role = userDocSnap.data().role || 'student';
        if (role === 'deleted') {
          return res.status(403).json({
            success: false,
            message: 'Account has been disabled.'
          });
        }
      } else {
        console.warn(`Notice: No Firestore document found for authenticated user: ${user.uid}`);
        // Create the missing document so future operations work
        await db.collection('users').doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          role: 'student',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn(`Firestore fetch error for ${user.uid}:`, e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        uid: user.uid,
        email: user.email,
        role: role
      }
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials or error during login'
    });
  }
};
