import { createContext } from "react";
import { SessionEntity } from "./entities";

const SessionContext = createContext<SessionEntity | undefined>(undefined);
export default SessionContext;
