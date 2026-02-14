<?php

namespace App\Services;

use Jenssegers\Agent\Agent;

class DeviceService
{
    public function detect()
    {
        \Log::info('Getting device information...');
        $agent = new Agent();
        
        return $this->deviceInfo($agent);
    }

    private function deviceInfo(Agent $agent): String
    {
        $info = [
            'device' => $agent->device(),
            'platform' => $agent->platform(),
            'browser' => $agent->browser(),
            'is_mobile' => $agent->isMobile(),
            'is_tablet' => $agent->isTablet(),
            'is_desktop' => $agent->isDesktop(),
        ];
        \Log::info('Device Info: '. json_encode($info));
        if ($agent->isiPhone()) {
            return 'iphone';
        }
        elseif ($agent->isiPad()) {
            return 'ipad';
        }
        elseif ($agent->isAndroidOS()) {
            return 'android';
        }
        elseif ($agent->isTablet()) {
            return 'tablet';
        }
        return 'desktop';
    }
}
