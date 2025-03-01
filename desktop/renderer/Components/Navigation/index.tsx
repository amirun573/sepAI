import {Fragment, useEffect, useRef} from 'react';
import {useRouter} from 'next/router';

const RouteHistoryManager = () => {
  const historyRef = useRef<string[]>([]);
  const forwardHistoryRef = useRef<string[]>([]);
  const router = useRouter();

  // Load history and forward history from localStorage on component mount
  useEffect(() => {
    const storedHistory = JSON.parse(
      localStorage.getItem('routeHistory') || '[]'
    );
    const storedForwardHistory = JSON.parse(
      localStorage.getItem('forwardRouteHistory') || '[]'
    );

    historyRef.current = storedHistory;
    forwardHistoryRef.current = storedForwardHistory;

    if (!historyRef.current.length) {
      historyRef.current.push(router.asPath);
      localStorage.setItem('routeHistory', JSON.stringify(historyRef.current));
    }

    console.log('Initial route history loaded:', historyRef.current);
    console.log('Initial forward history loaded:', forwardHistoryRef.current);
  }, []);

  // Update history on route change if not triggered by goBack or goForward
  useEffect(() => {
    const currentUrl = router.asPath;

    if (historyRef.current[historyRef.current.length - 1] !== currentUrl) {
      historyRef.current.push(currentUrl);
      localStorage.setItem('routeHistory', JSON.stringify(historyRef.current));

      // Clear forward history when a new route is pushed
      forwardHistoryRef.current = [];
      localStorage.setItem('forwardRouteHistory', JSON.stringify([]));

      console.log('Updated route history after change:', historyRef.current);
    }
  }, [router.asPath]);

  const goBack = () => {
    if (historyRef.current.length > 1) {
      // Move the current route to forward history
      const previousRoute = historyRef.current[historyRef.current.length - 2];
      forwardHistoryRef.current.unshift(historyRef.current.pop()!);
      localStorage.setItem(
        'forwardRouteHistory',
        JSON.stringify(forwardHistoryRef.current)
      );

      // Remove the last entry and update localStorage
      historyRef.current.pop();
      localStorage.setItem('routeHistory', JSON.stringify(historyRef.current));
      console.log(
        'Navigated back, updated histories:',
        historyRef.current,
        forwardHistoryRef.current
      );

      router.push(previousRoute);
    }
  };

  const goForward = () => {
    if (forwardHistoryRef.current.length > 0) {
      const nextRoute = forwardHistoryRef.current.shift()!;
      historyRef.current.push(nextRoute);
      localStorage.setItem('routeHistory', JSON.stringify(historyRef.current));
      localStorage.setItem(
        'forwardRouteHistory',
        JSON.stringify(forwardHistoryRef.current)
      );
      console.log(
        'Navigated forward, updated histories:',
        historyRef.current,
        forwardHistoryRef.current
      );

      router.push(nextRoute);
    }
  };

  return (
    <Fragment>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '4px', // Small gap between buttons
        }}
      >
        <button
          onClick={goBack}
          disabled={historyRef.current.length <= 1}
          style={{
            padding: '8px 12px',
            color: historyRef.current.length > 1 ? '#FFFFFF' : '#AAAAAA',
            backgroundColor:
              historyRef.current.length > 1 ? '#007BFF' : '#E0E0E0',
            border: 'none',
            borderRadius: '4px',
            cursor: historyRef.current.length > 1 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button
          onClick={goForward}
          disabled={forwardHistoryRef.current.length === 0}
          style={{
            padding: '8px 12px',
            color: forwardHistoryRef.current.length > 0 ? '#FFFFFF' : '#AAAAAA',
            backgroundColor:
              forwardHistoryRef.current.length > 0 ? '#007BFF' : '#E0E0E0',
            border: 'none',
            borderRadius: '4px',
            cursor:
              forwardHistoryRef.current.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </Fragment>
  );
};

export default RouteHistoryManager;
