# Foundry Quickstart

> A basic "Hello World" app with Foundry.

This code is the result of doing the Falcon Foundry Quickstart. To see how it was created, please visit our documentation: [US-1](https://falcon.crowdstrike.com/documentation/page/p3e6b484/foundry-quickstart) | [US-2](https://falcon.us-2.crowdstrike.com/documentation/page/p3e6b484/foundry-quickstart) | [EU](https://falcon.eu-1.crowdstrike.com/documentation/page/p3e6b484/foundry-quickstart).

## Prerequisites

- Falcon Insight XDR or Falcon Prevent
- The Foundry CLI (instructions below)

### Install the Foundry CLI

You can install the Foundry CLI with Homebrew on Linux/macOS.

**Linux and macOS**:

Install [Homebrew](https://docs.brew.sh/Installation). Then, add the Foundry CLI repository to the list of formulae that Homebrew uses and install the CLI:

```shell
brew tap crowdstrike/foundry-cli
brew install foundry
```

**Windows**:

Download the [latest Windows zip file](https://assets.foundry.crowdstrike.com/cli/latest/foundry_Windows_x86_64.zip), expand it, and add the installation directory to your PATH environment variable.

Verify it's installed correctly:

```shell
foundry version
```

## Getting Started

Clone this repository to your local system, or [download it as a zip file](https://github.com/CrowdStrike/foundry-quickstart/archive/refs/heads/main.zip).

```shell
git clone https://github.com/CrowdStrike/foundry-quickstart
cd foundry-quickstart
```

Log in to Foundry:

```shell
foundry login
```

You don't need to select any specific permissions since this is just a hello world app.

- [ ] Run RTR Scripts
- [ ] Run, execute, and test Workflows
- [ ] Run, execute, and test API integrations
- [ ] Run, execute, and test LogScale queries
- [ ] (optional) Generate mock data to test your app

Deploy the app:

```shell
foundry apps deploy
```

> [!TIP]
> If you get an error that the name already exists, change the name to something unique to your CID in `manifest.yml`.

Once the deployment has finished, you can release the app:

```shell
foundry apps release
```

Next, go to **Foundry** > **App catalog**, find your app, and install it. Select the **Open App** button in the success dialog.

> [!TIP]
> If the app doesn't load, reload the page.

## Links

This example uses the following CrowdStrike products:

* [Falcon Platform](https://www.crowdstrike.com/platform/)
* [Falcon Foundry](https://www.crowdstrike.com/platform/next-gen-siem/falcon-foundry/)

## Help

Please post any questions as issues in this repo or ask for help in our [CrowdStrike subreddit](https://www.reddit.com/r/crowdstrike/).

## License

MIT, see [LICENSE](LICENSE).
