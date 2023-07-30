import DefaultSession from "../default/DefaultSession";
import pythonStrategies from "./strategies";

export default class PythonSession extends DefaultSession {
  override strategies = pythonStrategies;
}
