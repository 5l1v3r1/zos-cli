import { FileSystem as fs } from 'zos-lib'
import Stdlib from './Stdlib';

const StdlibProvider = {
  from(name, version, network) {
    const filename = `node_modules/${name}/zos.${network}.json`
    if(!fs.exists(filename)) throw Error(`Could not find a zos file for network '${network}' for the requested stdlib ${name}@${version}. Please make sure it is provided or at least self-deployed if you are in development mode.`)
    const networkInfo = fs.parseJson(filename)
    if (!Stdlib.satisfies(networkInfo.version, version)) {
      throw Error(`Requested stdlib version ${version} does not match stdlib network package version ${networkInfo.version}`)
    }
    return {
      address: networkInfo.provider.address,
      version: networkInfo.version
    }
  }
}

export default StdlibProvider
