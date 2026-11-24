import jwt from 'jsonwebtoken'

// Protects a route: checks for a valid "Bearer <token>" in the Authorization header.
// If valid, attaches the user's id to req.userId so route handlers know who is asking.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please log in again.' })
  }
}
