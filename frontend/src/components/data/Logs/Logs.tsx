import { logs$, logTypeToConsoleMethod } from '@services/logs/logs.service';
import { useBehaviorSubject } from '@services/ui-ux/hooks/useBehaviorSubject';
import { Console } from 'console-feed';
import { Message } from 'console-feed/lib/definitions/Component';
import moment from 'moment';
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useScroll } from 'react-use';

export const Logs: FC = () => {
  const rawLogs = useBehaviorSubject(logs$);
  const logsRef = useRef(null);
  const logsScrollState = useScroll(logsRef);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const logs: Message[] = useMemo(() => {
    return rawLogs?.map(l => ({
      id: l.id,
      data: [l.name, l.message || l.json],
      method: logTypeToConsoleMethod(l.type),
      timestamp: moment(l.createdAt).format("HH:mm:ss")
    }));
  }, [rawLogs]);

  useEffect(() => {
    const logsElement = logsRef.current;
    if (!logsElement)
      return;

    if (isAtBottom) {
      // Continue auto scrolling to stick to the bottom to bottom of div
      logsElement.scrollTop = logsElement.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]); // Important: Do not depend on scroll state

  useEffect(() => {
    setIsAtBottom(logsScrollState.y === logsRef.current?.scrollHeight - logsRef.current?.clientHeight);
  }, [logsRef, logsScrollState.y]);

  return (
    <div ref={logsRef} style={{ backgroundColor: '#242424', height: "100%", overflowY: "auto", padding: 10 }}>
      <Console logs={logs} variant="dark" styles={{
        LOG_COLOR: "#fff",
        BASE_FONT_SIZE: 14
      }} />
    </div>
  )
}