import React from'react';import{render,waitFor,fireEvent}from'@testing-library/react-native';import{ErrorBoundary,ErrorCategory}from'../ErrorBoundary';import{getAnalyticsService}from'../../analytics/AnalyticsService';jest.mock('../../analytics/AnalyticsService');jest.mock('../../utils/debug',()=>({createDebugger:()=>({debug:jest.fn(),info:jest.fn(),warn:jest.fn(),error:jest.fn()})}));const mockAnalytics={track:jest.fn()};(getAnalyticsService as jest.Mock).mockReturnValue(mockAnalytics);const ThrowError=({shouldThrow}:{shouldThrow:boolean;})=>{if(shouldThrow){throw new Error('Test error');}return<div>Normal render</div>;};const ThrowNetworkError=()=>{const error=new Error('Network request failed');error.name='NetworkError';throw error;};const ThrowAuthError=()=>{const error=new Error('Unauthorized');error.name='AuthError';throw error;};const ThrowClientError=()=>{const error=new Error('Client error');throw error;};describe('ErrorBoundary',()=>{beforeEach(()=>{jest.clearAllMocks();jest.useRealTimers();});describe('Error Catching',()=>{it('should catch errors in children',()=>{const{getByText}=render(<ErrorBoundary>
          <ThrowError shouldThrow={true}/>
        </ErrorBoundary>);expect(getByText('Oops! Something went wrong')).toBeTruthy();});it('should render children when no error',()=>{const{getByText}=render(<ErrorBoundary>
          <ThrowError shouldThrow={false}/>
        </ErrorBoundary>);expect(getByText('Normal render')).toBeTruthy();});it('should categorize network errors',()=>{const{getByText}=render(<ErrorBoundary>
          <ThrowNetworkError/>
        </ErrorBoundary>);expect(getByText('Connection lost. Check your internet and try again.')).toBeTruthy();});it('should categorize auth errors',()=>{const{getByText}=render(<ErrorBoundary>
          <ThrowAuthError/>
        </ErrorBoundary>);expect(getByText('Session expired. Please sign in again.')).toBeTruthy();});it('should categorize client errors',()=>{const{getByText}=render(<ErrorBoundary>
          <ThrowClientError/>
        </ErrorBoundary>);expect(getByText('An unexpected error occurred. Please restart the app.')).toBeTruthy();});});describe('Analytics Integration',()=>{it('should track errors',()=>{render(<ErrorBoundary>
          <ThrowError shouldThrow={true}/>
        </ErrorBoundary>);expect(mockAnalytics.track).toHaveBeenCalledWith('error',expect.objectContaining({error:'Test error',category:expect.any(String)}));});it('should mark client errors as fatal',()=>{render(<ErrorBoundary>
          <ThrowClientError/>
        </ErrorBoundary>);expect(mockAnalytics.track).toHaveBeenCalledWith('error',expect.objectContaining({fatal:true}));});});describe('Retry Logic',()=>{it('should show retry button for recoverable errors',()=>{const{getByText}=render(<ErrorBoundary>
          <ThrowNetworkError/>
        </ErrorBoundary>);expect(getByText('Try Again')).toBeTruthy();});it('should not show retry for client errors',()=>{const{queryByText}=render(<ErrorBoundary>
          <ThrowClientError/>
        </ErrorBoundary>);expect(queryByText('Try Again')).toBeNull();});it('should call onRetry when retry button pressed',()=>{const onReset=jest.fn();const{getByText}=render(<ErrorBoundary onReset={onReset}>
          <ThrowNetworkError/>
        </ErrorBoundary>);fireEvent.press(getByText('Try Again'));expect(onReset).toHaveBeenCalled();});it('should track retry count',()=>{const{getByText}=render(<ErrorBoundary maxRetries={3}>
          <ThrowNetworkError/>
        </ErrorBoundary>);fireEvent.press(getByText('Try Again'));expect(getByText('Retry attempt 1 of 3')).toBeTruthy();});it('should show loading state during retry',async()=>{const onReset=jest.fn().mockImplementation(()=>new Promise(resolve=>setTimeout(resolve,100)));const{getByText,queryByText}=render(<ErrorBoundary onReset={onReset}>
          <ThrowNetworkError/>
        </ErrorBoundary>);fireEvent.press(getByText('Try Again'));await waitFor(()=>{expect(queryByText('Retrying...')).toBeTruthy();});});});describe('Degraded Mode',()=>{it('should show degraded mode option',()=>{const{getByText}=render(<ErrorBoundary allowDegraded={true}>
          <ThrowNetworkError/>
        </ErrorBoundary>);expect(getByText('Continue Anyway')).toBeTruthy();});it('should enter degraded mode on continue',()=>{const{getByText,queryByText}=render(<ErrorBoundary allowDegraded={true}>
          <ThrowNetworkError/>
        </ErrorBoundary>);fireEvent.press(getByText('Continue Anyway'));expect(getByText('Running in limited mode')).toBeTruthy();expect(queryByText('Oops! Something went wrong')).toBeNull();});it('should render degraded fallback when provided',()=>{const degradedFallback=<div>Custom degraded UI</div>;const{getByText}=render(<ErrorBoundary allowDegraded={true}degradedFallback={degradedFallback}>
          <ThrowNetworkError/>
        </ErrorBoundary>);fireEvent.press(getByText('Continue Anyway'));expect(getByText('Custom degraded UI')).toBeTruthy();});it('should not show degraded mode for non-recoverable errors',()=>{const{queryByText}=render(<ErrorBoundary allowDegraded={true}>
          <ThrowClientError/>
        </ErrorBoundary>);expect(queryByText('Continue Anyway')).toBeNull();});});describe('Auto-Retry',()=>{it('should auto-retry network errors',async()=>{jest.useFakeTimers();const onReset=jest.fn().mockResolvedValue(undefined);render(<ErrorBoundary onReset={onReset}retryDelay={1000}>
          <ThrowNetworkError/>
        </ErrorBoundary>);jest.advanceTimersByTime(1000);await waitFor(()=>{expect(onReset).toHaveBeenCalled();});jest.useRealTimers();});it('should not auto-retry client errors',async()=>{jest.useFakeTimers();const onReset=jest.fn();render(<ErrorBoundary onReset={onReset}retryDelay={1000}>
          <ThrowClientError/>
        </ErrorBoundary>);jest.advanceTimersByTime(5000);expect(onReset).not.toHaveBeenCalled();jest.useRealTimers();});it('should stop retrying after max retries',async()=>{jest.useFakeTimers();const onReset=jest.fn().mockRejectedValue(new Error('Retry failed'));const{getByText}=render(<ErrorBoundary onReset={onReset}maxRetries={2}retryDelay={100}>
          <ThrowNetworkError/>
        </ErrorBoundary>);jest.advanceTimersByTime(100);await waitFor(()=>{expect(getByText('Retry attempt 1 of 2')).toBeTruthy();});jest.advanceTimersByTime(200);await waitFor(()=>{expect(getByText('Retry attempt 2 of 2')).toBeTruthy();});jest.advanceTimersByTime(400);jest.useRealTimers();});});describe('Custom Fallback',()=>{it('should render custom fallback when provided',()=>{const fallback=<div>Custom error UI</div>;const{getByText}=render(<ErrorBoundary fallback={fallback}>
          <ThrowError shouldThrow={true}/>
        </ErrorBoundary>);expect(getByText('Custom error UI')).toBeTruthy();});});describe('Error Handler Callback',()=>{it('should call onError with error details',()=>{const onError=jest.fn();render(<ErrorBoundary onError={onError}>
          <ThrowNetworkError/>
        </ErrorBoundary>);expect(onError).toHaveBeenCalledWith(expect.objectContaining({message:'Network request failed'}),expect.objectContaining({componentStack:expect.any(String)}),'network'as ErrorCategory);});});describe('Edge Cases',()=>{it('should handle multiple errors',()=>{const{getByText,rerender}=render(<ErrorBoundary>
          <ThrowError shouldThrow={true}/>
        </ErrorBoundary>);expect(getByText('Oops! Something went wrong')).toBeTruthy();rerender(<ErrorBoundary>
          <ThrowError shouldThrow={false}/>
        </ErrorBoundary>);expect(getByText('Normal render')).toBeTruthy();});it('should cleanup timers on unmount',()=>{jest.useFakeTimers();const{unmount}=render(<ErrorBoundary retryDelay={5000}>
          <ThrowNetworkError/>
        </ErrorBoundary>);unmount();jest.advanceTimersByTime(5000);jest.useRealTimers();});it('should handle error with null message',()=>{const ThrowNullError=()=>{const error=new Error();(error as any).message=null;throw error;};const{getByText}=render(<ErrorBoundary>
          <ThrowNullError/>
        </ErrorBoundary>);expect(getByText('Something went wrong')).toBeTruthy();});});});
