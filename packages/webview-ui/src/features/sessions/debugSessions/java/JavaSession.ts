import DefaultSession from "../default/DefaultSession";
import javaStrategies from "./strategies";

export default class JavaSession extends DefaultSession {
  override strategies = javaStrategies;
}