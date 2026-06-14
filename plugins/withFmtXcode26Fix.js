const { withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const WORKAROUND_MARKER = 'Xcode 26 workaround: disable fmt consteval';

const FMT_PATCH = `
    # ${WORKAROUND_MARKER}
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end

    patched_fmt = false
    Dir.glob(File.join(installer.sandbox.root, '**/fmt/base.h')).each do |fmt_base|
      content = File.read(fmt_base)
      updated = content.gsub('# define FMT_USE_CONSTEVAL 1', '# define FMT_USE_CONSTEVAL 0')
      next if updated == content

      File.chmod(0644, fmt_base)
      File.write(fmt_base, updated)
      patched_fmt = true
      Pod::UI.puts "${WORKAROUND_MARKER}: patched \#{fmt_base}"
    end

    unless patched_fmt
      Pod::UI.warn "${WORKAROUND_MARKER}: fmt/base.h not found under \#{installer.sandbox.root}"
    end
`;

function withFmtXcode26Fix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) {
        return config;
      }

      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (contents.includes(WORKAROUND_MARKER)) {
        return config;
      }

      const updated = contents.replace(
        /(\s+react_native_post_install\([\s\S]*?\n\s+\)\n)/,
        `$1${FMT_PATCH}\n`
      );

      if (updated === contents) {
        throw new Error(
          'withFmtXcode26Fix: Could not find react_native_post_install in Podfile'
        );
      }

      fs.writeFileSync(podfilePath, updated);
      return config;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withFmtXcode26Fix,
  'with-fmt-xcode26-fix',
  '1.1.0'
);
