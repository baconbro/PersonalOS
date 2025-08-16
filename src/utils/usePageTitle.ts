// React hook for managing page titles in components
import { useEffect } from 'react';
import { setCustomPageTitle, resetPageTitle } from './pageTitle';

interface UsePageTitleOptions {
  /**
   * The main title for the page
   */
  title: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Whether to reset title on unmount (default: true)
   */
  resetOnUnmount?: boolean;
}

/**
 * Hook for setting custom page titles in components
 * Useful for dynamic content like editing specific goals
 */
export function usePageTitle({ title, subtitle, resetOnUnmount = true }: UsePageTitleOptions) {
  useEffect(() => {
    setCustomPageTitle(title, subtitle);
    
    if (resetOnUnmount) {
      return () => {
        resetPageTitle();
      };
    }
  }, [title, subtitle, resetOnUnmount]);
}

/**
 * Hook for appending dynamic content to existing page titles
 * Useful for showing counts, status, or other dynamic info
 */
export function usePageTitleSuffix(suffix?: string) {
  useEffect(() => {
    if (suffix) {
      const currentTitle = document.title;
      const baseTitle = currentTitle.includes(' - PersonalOS') 
        ? currentTitle.split(' - PersonalOS')[0] 
        : currentTitle;
      document.title = `${baseTitle} ${suffix} - PersonalOS`;
    }
    
    return () => {
      // Remove suffix on unmount
      if (suffix) {
        const currentTitle = document.title;
        const cleanTitle = currentTitle.replace(` ${suffix}`, '');
        document.title = cleanTitle;
      }
    };
  }, [suffix]);
}

/**
 * Hook for temporarily overriding page title (e.g., during loading states)
 */
export function useTemporaryPageTitle(temporaryTitle?: string, condition: boolean = true) {
  useEffect(() => {
    let originalTitle: string;
    
    if (temporaryTitle && condition) {
      originalTitle = document.title;
      document.title = `${temporaryTitle} - PersonalOS`;
      
      return () => {
        document.title = originalTitle;
      };
    }
  }, [temporaryTitle, condition]);
}
