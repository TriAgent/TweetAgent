import { logs$, logTypeToConsoleMethod } from '@services/logs/logs.service';
import { useBehaviorSubject } from '@services/ui-ux/hooks/useBehaviorSubject';
import { Console } from 'console-feed';
import { Message } from 'console-feed/lib/definitions/Component';
import moment from 'moment';
import { FC, useEffect, useMemo, useRef } from "react";

export const Logs: FC = () => {
  const rawLogs = useBehaviorSubject(logs$);
  const logsRef = useRef(null);

  const logs: Message[] = useMemo(() => {
    return rawLogs?.map(l => ({
      id: l.id,
      data: [l.name, l.message || l.json],
      method: logTypeToConsoleMethod(l.type),
      timestamp: moment(l.createdAt).format("HH:mm:ss")
    }));
  }, [rawLogs]);

  useEffect(() => {
    // Scroll to bottom of div
    logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  return (
    <div ref={logsRef} style={{ backgroundColor: '#242424', height: "100%", overflowY: "auto", padding: 10 }}>
      <Console logs={logs} variant="dark" styles={{
        LOG_COLOR: "#fff",
        BASE_FONT_SIZE: 14
      }} />
    </div>
  )
}