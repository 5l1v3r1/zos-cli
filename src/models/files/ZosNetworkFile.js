import _ from 'lodash'
import { bytecodeDigest } from '../../utils/digest'
import { Logger, FileSystem as fs } from 'zos-lib'

const log = new Logger('ZosNetworkFile')

export default class ZosNetworkFile {

  constructor(packageFile, network, fileName) {
    this.packageFile = packageFile
    this.network = network
    this.fileName = fileName

    const defaults = this.packageFile.isLib() ? { contracts: {}, lib: true, frozen: false } : { contracts: {}, proxies: {} }
    this.data = fs.parseJsonIfExists(this.fileName) || defaults
  }

  get app() {
    return this.data.app
  }

  get appAddress() {
    return this.app && this.app.address
  }

  get package() {
    return this.data.package
  }

  get packageAddress() {
    return this.package && this.package.address
  }

  get provider() {
    return this.data.provider
  }

  get providerAddress() {
    return this.provider && this.provider.address
  }

  get version() {
    return this.data.version
  }

  get frozen() {
    return this.data.frozen
  }

  get stdlib() {
    return this.data.stdlib
  }

  get stdlibName() {
    return this.stdlib.name
  }

  get stdlibVersion() {
    return this.stdlib.version
  }

  get stdlibAddress() {
    return this.stdlib.address
  }

  get proxies() {
    return this.data.proxies
  }

  get contracts() {
    return this.data.contracts
  }

  proxy(alias) {
    return this.proxies[alias]
  }

  contract(alias) {
    return this.contracts[alias]
  }

  isLib() {
    return this.packageFile.isLib()
  }

  hasVersion(version) {
    return this.version === version
  }

  hasProxies() {
    return !_.isEmpty(this.proxies)
  }

  hasContract(alias) {
    return !_.isEmpty(this.contract(alias))
  }

  hasMatchingVersion() {
    return this.packageFile.hasVersion(this.version)
  }

  hasCustomDeploy() {
    return this.hasStdlib() && this.stdlib.customDeploy
  }

  hasMatchingCustomDeploy() {
    return this.hasCustomDeploy() && this.packageFile.hasStdlib(this.stdlib)
  }

  hasStdlib(stdlib = undefined) {
    if(stdlib === undefined) return !_.isEmpty(this.stdlib)
    return this.stdlib.name === stdlib.name && this.stdlib.version === stdlib.version
  }

  hasSameBytecode(alias, klass) {
    const deployedBytecode = this.contract(alias).bytecodeHash
    const currentBytecode = bytecodeDigest(klass.bytecode)
    return currentBytecode !== deployedBytecode
  }

  set version(version) {
    this.data.version = version
  }

  set contracts(contracts) {
    this.data.contracts = contracts
  }

  set frozen(frozen) {
    this.data.frozen = frozen
  }

  set app(app) {
    this.data.app = app
  }

  set provider(provider) {
    this.data.provider = provider
  }

  set stdlib(stdlib) {
    this.data.stdlib = stdlib
  }

  set package(_package) {
    this.data.package = _package
  }

  unsetStdlib() {
    delete this.data['stdlib']
  }

  setContract(alias, instance) {
    this.data.contracts[alias] = {
      address: instance.address,
      bytecodeHash: bytecodeDigest(instance.constructor.bytecode)
    }
  }

  setProxy(alias, value) {
    this.data.proxies[alias] = value
  }

  addProxy(alias, info) {
    if (!this.proxy(alias)) this.setProxy(alias, [])
    this.data.proxies[alias].push(info)
  }

  write() {
    fs.writeJson(this.fileName, this.data)
    log.info(`Successfully written ${this.fileName}`)
  }
}
