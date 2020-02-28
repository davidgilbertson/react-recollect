/**
 * Define the shape of your store in your project - see README.
 */

export interface Store {}

export interface StoreUpdater {
  target: object;
  prop?: any;
  value?: any;
  updater: (target: any, value: any) => void;
}
