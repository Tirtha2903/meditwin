#include <smartspectra/container/foreground_container.hpp>
#include <smartspectra/container/settings.hpp>
#include <physiology/modules/messages/metrics.h>
#include <glog/logging.h>
#include <iostream>
#include <atomic>
#include <chrono>
#include <thread>

using namespace presage::smartspectra;

int main(int argc, char** argv) {
  google::InitGoogleLogging(argv[0]);
  FLAGS_alsologtostderr = false;

  std::string apiKey = "1Yb3nMHJ6I3XmbM2Fas5d3NvQs9EizZu7ySfVwMu";

  typedef container::settings::Settings<container::settings::OperationMode::Spot, container::settings::IntegrationMode::Rest> SettingsType;
  SettingsType settings;
  settings.video_source.device_index = 0;
  settings.video_source.capture_width_px = 640;
  settings.video_source.capture_height_px = 480;
  settings.video_source.codec = presage::camera::CaptureCodec::MJPG;
  settings.video_source.resolution_selection_mode = video_source::ResolutionSelectionMode::Exact;
  settings.video_source.enable_camera_tuning = true;
  settings.video_source.auto_lock = false;
  settings.video_source.input_transform_mode = video_source::InputTransformMode::None;
  settings.integration.api_key = apiKey;
  settings.headless = true;
  settings.spot.spot_duration_s = 30.0;

  auto container = std::make_unique<container::CpuSpotRestForegroundContainer>(settings);

  std::atomic<bool> done{false};
  int pulse_result = 0;
  int breathing_result = 0;

  container->SetOnCoreMetricsOutput([&](const presage::physiology::MetricsBuffer& metrics, int64_t) -> absl::Status {
    pulse_result = static_cast<int>(metrics.pulse().strict().value());
    breathing_result = static_cast<int>(metrics.breathing().strict().value());
    if (pulse_result > 0) {
      std::cout << "{\"heart_rate\":" << pulse_result << ",\"breathing_rate\":" << breathing_result << "}" << std::endl;
      done = true;
    }
    return absl::OkStatus();
  });

  container->Initialize();

  std::thread run_thread([&]() { container->Run(); });

  int waited = 0;
  while (!done && waited < 120) {
    std::this_thread::sleep_for(std::chrono::seconds(1));
    waited++;
  }

  if (!done) {
    std::cout << "{\"error\":\"No reading obtained\"}" << std::endl;
  }

  return 0;
}