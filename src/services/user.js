export default class User {
  #username;
  #password;

  constructor(username, password) {
    this.#username = username;
    this.#password = password;
  }

  async getUsername() {
    return this.#username;
  }

  async authenticate(inputUsername, inputPassword) {
    return this.#username === inputUsername && this.#password === inputPassword;
  }
}
