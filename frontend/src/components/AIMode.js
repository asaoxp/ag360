import { useEffect } from 'react';

export default function AIMode() {
  useEffect(() => {
    // Redirect when page loads
    window.location.href = "http://10.60.196.201";
  }, []);

  return null; // nothing to render
}
