// TODO create class to store "modal states" for single-instance-multi-purpose modals

/**
 * - create a handler that can save and restore states so one modal can be used multiple times simutaneously
 *     - on loose focus store state in handler
 *     - on push into focus restore state into modal
 * - events should be redispatched by the handler
 * - only one handler will get the attention of the modal at any time
 */
