export function validateLoginForm(login: { email: string; password: string }) {
  const { email, password } = login;
  
  if (!email.trim()) {
    return "Email is required.";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }
  
  const domainPart = email.split("@")[1];
  if (!domainPart || !/\.[a-z]{2,}$/.test(domainPart)) {
    return "Invalid email domain.";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
  if (!passwordRegex.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  
  return null;
} 