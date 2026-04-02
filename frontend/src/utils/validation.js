export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => String(password || '').length >= 6;

export const validatePhone = (phone) => /^[0-9]{10}$/.test(String(phone || '').replace(/\D/g, ''));

export const validateForm = (data, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  });

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.password && !validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }

  if (data.profileDescription && data.profileDescription.length > 1500) {
    errors.profileDescription = 'Profile description cannot exceed 1500 characters';
  }

  return errors;
};
