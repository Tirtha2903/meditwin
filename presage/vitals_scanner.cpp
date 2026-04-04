#include <smartspectra/container/foreground_container.hpp>
#include <smartspectra/container/settings.hpp>
#include <physiology/modules/messages/metrics.h>
#include <glog/logging.h>
#include <iostream>
#include <atomic>

using namespace presage::smartspectra;

int main(int argc, char** argv) {
  google::InitGoogleLogging(argv[0]);
  FLAGS_alsologtostderr = false;

  std::string apiKey = "1Yb3nMHJ6I3XmbM2Fas5d3NvQs9EizZu7ySfVwMu";

  container::settings::Settings
      container::settings::OperationMode::Spot,
      container::settings::IntegrationMode::Rest> settings;
  settings.video_source.device_index = 0;
  settings.integration.api_key = apiKey;
  settings.headless = true;

  auto container = std::make_unique<container::CpuSpotRestForegroundContainer>(settings);

  std::atomic<bool> done{false};

  container->SetOnCoreMetricsOutput([&done](const presage::physiology::MetricsBuffer& metrics, int64_t) {
    int pulse = static_cast<int>(metrics.pulse().strict().value());
    int breathing = static_cast<int>(metrics.breathing().strict().value());
    std::cout << "{\"heart_rate\":" << pulse << ",\"breathing_rate\":" << breathing << "}" << std::endl;
    done = true;
    return absl::OkStatus();
  });

  container->Initialize();
  container->Run();
  return 0;
}
