import { 
	useEffect,
	useMemo,
  useCallback, 
  useRef, 
  useState
} from 'react'

import type { MutableRefObject, RefCallback, Ref } from 'react'


export type CallbackWithNoArguments = () => void
const noop = () => {}

/**
 * useDidMount hook
 * @description Calls a function on mount
 *
 * @param {Function} callback Callback function to be called on mount
 * @see https://rooks.vercel.app/docs/useDidMount
 */
function useDidMount(callback: CallbackWithNoArguments): void {
  useEffect(() => {
    if (typeof callback === "function") {
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { useDidMount }

export type PossibleRef<T> = Ref<T> | undefined;
/**
 * Credit to material-ui for this snippet
 */

function setRef<T>(ref: PossibleRef<T> | null, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as MutableRefObject<T>).current = value;
  }
}

/**
 * useForkRef
 * Joins refs together and returns a combination of the two as a new ref
 *
 * @param refA
 * @param refB
 * @returns MutableRefObject
 * @see https://rooks.vercel.app/docs/useForkRef
 */
function useForkRef<T>(
  refA: PossibleRef<T> | null,
  refB: PossibleRef<T> | null
): RefCallback<T> | null {
  /**
   * This will create a new function if the ref props change and are defined.
   * This means react will call the old forkRef with `null` and the new forkRef
   * with the ref. Cleanup naturally emerges from this behavior
   */
  return useMemo(() => {
    if (refA === null && refB === null) {
      return null;
    }

    return (refValue: T) => {
      setRef(refA, refValue);
      setRef(refB, refValue);
    };
  }, [refA, refB]);
}

export { useForkRef }

const config: ResizeObserverOptions = {
  box: "content-box",
};

export type HTMLElementOrNull = HTMLElement | null;

export type CallbackRef<T extends HTMLElement | null = HTMLElementOrNull> = (
  node: T
) => void;

/**
 *
 * useResizeObserverRef hook
 *
 * Returns a resize observer for a React Ref and fires a callback
 * https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
 *
 * @param {ResizeObserverCallback} callback Function that needs to be fired on resize
 * @param {ResizeObserverOptions} options An options object allowing you to set options for the observation
 * @returns {[CallbackRef]} callbackref
 * @see https://rooks.vercel.app/docs/useResizeObserverRef
 */
function useResizeObserver(
  ref: MutableRefObject<HTMLElement | null>,
  callback: ResizeObserverCallback | undefined,
  options: ResizeObserverOptions = config
): void {
  const { box } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const handleResizeObserver = useCallback<ResizeObserverCallback>(
    (...args) => {
      callbackRef.current?.(...args);
    },
    []
  );

  useEffect(() => {
    if (ref.current) {
      // Create an observer instance linked to the callback function
      const observer = new ResizeObserver(handleResizeObserver);

      // Start observing the target node for resizes
      observer.observe(ref.current, { box });

      return () => {
        observer.disconnect();
      };
    }
    return noop;
  }, [ref, handleResizeObserver, box]);
}

export { useResizeObserver }


const MutationObserverconfig: MutationObserverInit = {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
};

/**
 *
 * useMutationObserver hook
 *
 * Returns a mutation observer for a React Ref and fires a callback
 *
 * @param {MutableRefObject<HTMLElement | null>} ref React ref on which mutations are to be observed
 * @param {MutationCallback} callback Function that needs to be fired on mutation
 * @param {MutationObserverInit} options
 * @see https://rooks.vercel.app/docs/useMutationObserver
 */
function useMutationObserver(
  ref: MutableRefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit = MutationObserverconfig
): void {
  useEffect(() => {
    // Create an observer instance linked to the callback function
    if (ref.current) {
      const observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      observer.observe(ref.current, options);

      return () => {
        observer.disconnect();
      };
    }

    return noop;
  }, [callback, options, ref]);
}

export { useMutationObserver };