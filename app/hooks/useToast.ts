/**
 * Re-export useToast from ToastContext for convenience
 * This provides a simple hook-based API for showing toast notifications
 *
 * @example
 * ```tsx
 * import { useToast } from '../hooks/useToast';
 *
 * const MyComponent = () => {
 *   const { showSuccess, showError } = useToast();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitData();
 *       showSuccess('Data submitted successfully!');
 *     } catch (error) {
 *       showError('Failed to submit data');
 *     }
 *   };
 * };
 * ```
 */

export { useToast } from "../context/ToastContext";
