using UnityEngine;
using System.Collections;

public delegate void OnTimerComplete(SimpleTimer timer);
public delegate void OnTimerUpdate(SimpleTimer timer , float time);
public class SimpleTimer : MonoBehaviour {

	public enum TimeOutput
	{
		progressive,
		regressive
	}

	private static int TIMER_ID = 0;

	private int m_id;
	public int Id
	{
		get{return m_id;}
	}

	public OnTimerComplete onTimerComplete;
	public OnTimerUpdate onTimerUpdate;

	public static SimpleTimer Init()
	{
		TIMER_ID++;
		GameObject go = new GameObject ();
		go.name = "SimpleTimer_" + TIMER_ID;
		SimpleTimer t = go.AddComponent<SimpleTimer> ();

		return t;
	}

	private bool m_loop;
	private float m_time;
	private float m_startTime;
	private bool m_running;
	
	public bool AutoDestroy = true;
	public TimeOutput Output = TimeOutput.regressive;


	void Awake()
	{
		m_id = int.Parse(gameObject.name.Split ('_') [1]);
	}

	public void StartTimer(float time)
	{
		StartTimer (time, false);
	}
	

	public void StartTimer(float time , bool loop )
	{
		m_time = time;
		m_loop = loop;

		m_startTime = Time.time;
		m_running = true;


		Debug.Log ("start timer: " + time);
	}

	public void Stop()
	{
		m_running = false;

		if(AutoDestroy)
			Destroy(gameObject);
	}

	void Update()
	{


		if (!m_running)
			return;


		float regressive = (m_startTime + m_time) - Time.time;
		float progressive = Time.time - m_startTime;

		if (regressive <=  0) {

			if(m_loop)
				m_startTime = Time.time;
			else
				Stop();

			if(onTimerComplete != null)
				onTimerComplete(this);

			return;
		}

		if(onTimerUpdate != null && Output == TimeOutput.regressive)
			onTimerUpdate (this, regressive);
		else if(onTimerUpdate != null && Output == TimeOutput.progressive)
			onTimerUpdate (this, progressive);

	}

}
