# Publishing

This is a quick checklist for publishing an extension to the Visual Studio Marketplace.
The full instructions can be found here: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

You need to a member of the publisher `ksu-alt-cs` to publish this extension to the marketplace.
If you are a member, you should see it in https://marketplace.visualstudio.com/manage.

## Package the extension

Increment the version in `package.json` then run `yarn vsce package` to make sure it can build the VSIX package correctly.
It should create `pedagogical-x.x.x.vsix`, which should be less than 1MB.
If you want to test this package, right-click the file in vscode and click Install Extension VSIX.

After you publish the extension, please also upload the VSIX package in a new release on GitHub.

## Authenticate in vsce

If you aren't already logged in to `vsce`, start by generating a personal access token.

1. Go to dev.azure.com and sign in with the account that is a member of `ksu-alt-cs`.
2. Create an organization if you don't already have one. (It doesn't matter what the organization is, you just need to have one to use Azure DevOps.)
3. Click the User settings icon on the top-right, then click Personal access tokens.
4. Create a new token with the scope **Marketplace** - **Manage**.
5. Run `yarn vsce login ksu-alt-cs`.
6. When prompted, paste the token you created.

## Publish the extension

If you haven't already, **increment the version in `package.json` and update `CHANGELOG.md`**.

Type `yarn vsce publish` to publish the extension. This should just work as long as you're authenticated.
