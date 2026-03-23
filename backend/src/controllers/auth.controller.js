import { auth } from '../firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        uid: user.uid,
        email: user.email,
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

    // You can also return await user.getIdToken() if you need to pass a token to the frontend
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        uid: user.uid,
        email: user.email,
      }
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials or error during login'
    });
  }
};
