import React from 'react';

export function usePersistentState(key, initialValue) {
    const [value, setValue] = React.useState(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item != null ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error(error);
        return initialValue;
      }
    });
    React.useEffect(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    }, [key, value]);
    return [value, setValue];
  }