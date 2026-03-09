import { redirect } from 'next/navigation';
import { removeWithExpiry } from '@/app/utils/authStorage';
import { removeProfile } from '@/app/utils/authStorage';
import { DefaultConstants } from '@/app/constants/defaults';

/**
 * Handle API response errors and redirect to home if unauthorized (403)
 * @param response - The fetch response object
 * @param redirectTo - Where to redirect on 403 (defaults to '/')
 */
export const handleApiError = (response: Response, redirectTo: string = '/') => {
  if (response.status === 403) {
    // Clear any stored authentication data
    if (typeof window !== 'undefined') {
      removeWithExpiry(DefaultConstants.tokenName);
      removeProfile();
      localStorage.removeItem('jwt');
      localStorage.removeItem('user_profile');
    }
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    } else {
      redirect(redirectTo);
    }
  }
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
};

/**
 * Check if response is unauthorized and handle accordingly
 * @param response - The fetch response object
 * @param redirectTo - Where to redirect on 403 (defaults to '/')
 * @returns true if unauthorized (redirected), false otherwise
 */
export const isUnauthorized = (response: Response, redirectTo: string = '/'): boolean => {
  if (response.status === 403) {
    // Clear any stored authentication data
    if (typeof window !== 'undefined') {
      removeWithExpiry(DefaultConstants.tokenName);
      removeProfile();
      localStorage.removeItem('jwt');
      localStorage.removeItem('user_profile');
    }
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    } else {
      redirect(redirectTo);
    }
    
    return true;
  }
  
  return false;
};