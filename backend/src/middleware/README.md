# Middleware

This directory contains custom middleware functions that process requests before they reach the route handlers.

Middleware should:
- Be reusable across different routes
- Handle cross-cutting concerns (authentication, logging, validation)
- Either call `next()` to continue processing or send a response
- Be well-documented with clear purposes