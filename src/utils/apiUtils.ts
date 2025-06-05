import authService from '../services/AuthService';

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Handle API response and extract data or error message
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Error: ${response.status}`);
  }
  
  return data.data;
};

/**
 * Create a fetch request with authentication and error handling
 */
export const createApiRequest = async <T>(
  url: string, 
  method: string = 'GET', 
  body?: any, 
  requiresAuth: boolean = true
): Promise<T> => {
  try {
    let response;
    
    if (requiresAuth) {
      const authenticatedFetch = authService.getAuthenticatedFetch();
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      response = await authenticatedFetch(url, options);
    } else {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      response = await fetch(url, options);
    }
    
    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
}; 