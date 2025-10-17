import { Trigger, deserializeTrigger } from './Trigger'
import { LLBind } from './LowLevelProfile'
export enum BindType {
  PressKey = 'press_key',
  ReleaseKey = 'release_key',
  TapKey = 'tap_key',
  SwitchLayer = 'switch_layer',
  Macro = 'macro',

  // Not handled by Daemon
  TimedMacro = 'timed_macro_bind',
  Repeat = 'repeat_bind',
  AppOpen = 'app_open_bind'
}

/**
 * Represents the desired bind to be associated with a key
 */
export abstract class Bind {
  /**
   * Type of the bind. Tap, macro, double tap, etc.
   */
  bind_type: BindType

  constructor(bind_type: BindType) {
    this.bind_type = bind_type
  }

  abstract toString(): string
  abstract toJSON(): object
  abstract equals(other: Bind): boolean
  abstract toLL(): LLBind[]
}

/**
 * Sends a key press event
 */
export class PressKey extends Bind {
  value: string

  constructor(value: string) {
    super(BindType.PressKey)
    this.value = value
  }

  toJSON(): object {
    return {
      type: BindType.PressKey,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): PressKey {
    return new PressKey(obj.value)
  }

  equals(other: Bind): boolean {
    return other instanceof PressKey && this.value === other.value
  }

  toString(): string {
    return `Press: ${this.value}`
  }

  toLL(): LLBind[] {
    return [{ type: "press_key", value: this.value }]
  }
}

/**
 * Fires a key release when the trigger is released.
 */
export class ReleaseKey extends Bind {
  value: string

  constructor(value: string) {
    super(BindType.ReleaseKey)
    this.value = value
  }

  toJSON(): object {
    return {
      type: BindType.ReleaseKey,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): ReleaseKey {
    return new ReleaseKey(obj.value)
  }

  equals(other: Bind): boolean {
    return other instanceof ReleaseKey && this.value === other.value
  }
  toString(): string {
    return `Release: ${this.value}`
  }

  toLL(): LLBind[] {
    return [{ type: "release_key", value: this.value }]
  }
}

/**
 * The simplest kind of bind, just activates one key.
 */
export class TapKey extends Bind {
  value: string

  constructor(value: string) {
    super(BindType.TapKey)
    this.value = value
  }

  toJSON(): object {
    return {
      type: BindType.TapKey,
      value: this.value
    }
  }

  static fromJSON(obj: { value: string }): TapKey {
    return new TapKey(obj.value)
  }

  equals(other: Bind): boolean {
    return other instanceof TapKey && this.value === other.value
  }

  toString(): string {
    return `Tap: ${this.value}`
  }

  toLL(): LLBind[] {
    return [{ type: "press_key", value: this.value }, { type: "release_key", value: this.value }]
  }
}

/**
 * A combination of different types of binds. Can be link and combo, combo and repeat, etc.
 */
export class Macro extends Bind {
  toString(): string {
    return `Macro: ${this.binds.map((b) => b.toString()).join(', ')}`
  }
  binds: Bind[]

  constructor(binds: Bind[]) {
    super(BindType.Macro)
    this.binds = binds
  }

  toJSON(): { type: BindType; binds: object[] } {
    return {
      type: BindType.Macro,
      binds: this.binds.map((bind) => bind.toJSON())
    }
  }

  static fromJSON(obj: { binds: object[] }): Macro {
    return new Macro(obj.binds.map(deserializeBind))
  }

  equals(other: Bind): boolean {
    return (
      other instanceof Macro &&
      this.binds.length === other.binds.length &&
      this.binds.every((b, i) => b.equals(other.binds[i]))
    )
  }

  toLL(): LLBind[] {
    return this.binds.map((b) => b.toLL()).flat();
  }
}

/**
 * A macro where there are time delays between each bind. Each time delay can be different.
 */
export class TimedMacro extends Bind {
  toString(): string {
    throw new Error('Method not implemented.')
  }
  binds: Bind[]
  times: number[]

  constructor(binds: Bind[], times: number[]) {
    super(BindType.TimedMacro)
    this.binds = binds
    this.times = times
  }

  toJSON(): object {
    return {
      type: BindType.TimedMacro,
      binds: this.binds.map((bind) => bind.toJSON()),
      times: this.times
    }
  }

  static fromJSON(obj: { binds: object[]; times: number[] }): TimedMacro {
    return new TimedMacro(obj.binds.map(deserializeBind), obj.times)
  }

  equals(other: Bind): boolean {
    return (
      other instanceof TimedMacro &&
      this.binds.length === other.binds.length &&
      this.times.length === other.times.length &&
      this.binds.every((b, i) => b.equals(other.binds[i])) &&
      this.times.every((t, i) => t === other.times[i])
    )
  }

  toLL(): LLBind[] {
    let binds: LLBind[] = [];
    for (let i = 0; i < binds.length; i++) {
      binds.push(...this.binds[i].toLL());
      if (i < this.times.length)
        binds.push({ type: "wait", value: this.times[i] });
    }
    return binds;
  }
}

/**
 * A bind that will repeat a certain number of times with or without a delay.
 */
export class Repeat extends Bind {
  toString(): string {
    throw new Error('Method not implemented.')
  }
  value: Bind

  /**
   * The amount of time between each execution of the bind
   */
  time_delay: number

  /**
   * The amount of times the bind will execute
   */
  times_to_execute: number

  /**
   * A trigger that can be pressed in order to stop the repeating bind.
   */
  cancel_trigger: Trigger

  constructor(value: Bind, time_delay: number, times_to_execute: number, cancel_trigger: Trigger) {
    super(BindType.Repeat)
    this.value = value
    this.time_delay = time_delay
    this.times_to_execute = times_to_execute
    this.cancel_trigger = cancel_trigger
  }

  toJSON(): object {
    return {
      type: BindType.Repeat,
      value: this.value.toJSON(),
      time_delay: this.time_delay,
      times_to_execute: this.times_to_execute,
      cancel_trigger: this.cancel_trigger.toJSON()
    }
  }

  static fromJSON(obj: {
    value: object
    time_delay: number
    times_to_execute: number
    cancel_trigger: object
  }): Repeat {
    return new Repeat(
      deserializeBind(obj.value),
      obj.time_delay,
      obj.times_to_execute,
      deserializeTrigger(obj.cancel_trigger)
    )
  }

  equals(other: Bind): boolean {
    return (
      other instanceof Repeat &&
      this.value.equals(other.value) &&
      this.time_delay === other.time_delay &&
      this.times_to_execute === other.times_to_execute &&
      this.cancel_trigger.equals(other.cancel_trigger)
    )
  }

  toLL(): LLBind[] {
    throw new Error('Method not implemented.')
  }
}

/**
 * Swaps to a different layer such that new triggers and binds are accessible.
 */
export class SwapLayer extends Bind {
  layer_number: number

  constructor(layer_num: number) {
    super(BindType.SwitchLayer)
    this.layer_number = layer_num
  }

  toJSON(): object {
    return {
      type: BindType.SwitchLayer,
      value: this.layer_number
    }
  }

  static fromJSON(obj: { value: number }): SwapLayer {
    return new SwapLayer(obj.value)
  }

  equals(other: Bind): boolean {
    return other instanceof SwapLayer && this.layer_number === other.layer_number
  }

  toString(): string {
    return `Swap Layer: ${this.layer_number}`
  }

  toLL(): LLBind[] {
    return [{ type: "switch_layer", value: this.layer_number }]
  }
}

// Not going to happen for a while
/**
 * Opens an application of the user's choice.
 */
export class AppOpen_Bind extends Bind {
  app_name: string

  constructor(app_name: string) {
    super(BindType.AppOpen)
    this.app_name = app_name
  }

  toJSON(): object {
    return {
      type: BindType.AppOpen,
      app_name: this.app_name
    }
  }

  static fromJSON(obj: { app_name: string }): AppOpen_Bind {
    return new AppOpen_Bind(obj.app_name)
  }

  equals(other: Bind): boolean {
    return other instanceof AppOpen_Bind && this.app_name === other.app_name
  }

  toString(): string {
    throw new Error('Method not implemented.')
  }

  toLL(): LLBind[] {
    throw new Error('Method not implemented.')
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeBind(obj: any): Bind {
  switch (obj.type) {
    case BindType.PressKey:
      return PressKey.fromJSON(obj)
    case BindType.ReleaseKey:
      return ReleaseKey.fromJSON(obj)
    case BindType.TapKey:
      return TapKey.fromJSON(obj)
    case BindType.Macro:
      return Macro.fromJSON(obj)
    case BindType.TimedMacro:
      return TimedMacro.fromJSON(obj)
    case BindType.Repeat:
      return Repeat.fromJSON(obj)
    case BindType.SwitchLayer:
      return SwapLayer.fromJSON(obj)
    case BindType.AppOpen:
      return AppOpen_Bind.fromJSON(obj)
    default:
      throw new Error(`Unknown Bind type: ${obj.type}`)
  }
}
