# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Fork Process

1. Ensure that you've installed the necessary tools in your system (eg, node-js and npm).
2. Fork this project into your own Github account.
3. When forking is done, clone `xcs-translator` from your account.

   ```git
   git clone git@github.com:YOUR_USERNAME/xcs-translator.git
   ```

4. Enter the cloned directory.
5. Specify new remote upstream that will be synched with your fork.

   ```git
   git remote add upstream git@github.com:hyperjumptech/xcs-translator.git
   ```

6. Verify the new upstream you've specified for your fork.

   ```git
   $ git remote -v
   > origin    git@github.com:YOUR_USERNAME/xcs-translator.git (fetch)
   > origin    git@github.com:YOUR_USERNAME/xcs-translator.git (push)
   > upstream  git@github.com:hyperjumptech/xcs-translator.git (fetch)
   > upstream  git@github.com:hyperjumptech/xcs-translator.git (push)
   ```

7. Now you can start committing code on your account
8. Remember to pull from your upstream often.

   ```git
   git pull upstream main
   ```

## Pull Request Process

1. Make sure you always have the most recent update from your upstream.

   ```git
   git pull upstream main
   ```

2. Resolve all conflict, if any.
3. Make sure `make test` always successful (you wont be able to create pull request if this fail, circle-ci, travis-ci and azure-devops will make sure of this.)
4. Push your code to your project's master repository.
5. Create PullRequest.
   - Go to `github.com/hyperjumptech/xcs-translator`
   - Select `Pull Request` tab
   - Click `New pull request` button
   - Click `compare across fork`
   - Change the source head repository from your fork and target is `hyperjumptech/xcs-translator`
   - Hit the `Create pull request` button
   - Fill in all necessary information to help us understand about your pull request.

If you notice that your Pull Request's check action/workflow never run,
please check in your **forked** xcs-translator repository, on the "Setting" > "Actions" tab, go to
"Fork pull request workflows" section and enable the "Run workflows from
fork pull requests", "Send write tokens to workflows from fork pull requests" and "Send secrets to workflows from fork pull requests" checkboxes.
And then click "Save". Remove your pull request, and create a new one.

### Important

**All test must succeed**

Always make sure that you have tested the code in your machine before making a pull request.
Asking to pull request for codes that do not pass test is NOT RIGHT.
Always make sure `make test` result a success prior making PR

**License Notification**

When you add a new source code into this project, always add a license notice at the beginning of your
source code file as follows

```
/**********************************************************************************
 *                                                                                *
 *    Copyright (C) 2021  XCS TRANSLATOR Contributors                             *
 *                                                                                *
 *   This program is free software: you can redistribute it and/or modify         *
 *   it under the terms of the GNU Affero General Public License as published     *
 *   by the Free Software Foundation, either version 3 of the License, or         *
 *   (at your option) any later version.                                          *
 *                                                                                *
 *   This program is distributed in the hope that it will be useful,              *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of               *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                *
 *   GNU Affero General Public License for more details.                          *
 *                                                                                *
 *   You should have received a copy of the GNU Affero General Public License     *
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.       *
 *                                                                                *
 **********************************************************************************/
```
